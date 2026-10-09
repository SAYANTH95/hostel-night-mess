
USE night_mess;

-- Supporting table for concurrency-safe daily token numbering
CREATE TABLE IF NOT EXISTS Token_Sequence (
    token_date DATE PRIMARY KEY,
    last_token INT NOT NULL DEFAULT 0,
    CHECK (last_token >= 0)
);

DROP PROCEDURE IF EXISTS PlaceBooking;

DELIMITER $$

CREATE PROCEDURE PlaceBooking(
    IN p_student_id INT,
    IN p_slot_id INT,
    IN p_booking_date DATE,
    IN p_items JSON,
    IN p_payment_mode VARCHAR(10),
    OUT p_booking_id INT,
    OUT p_token_no INT
)
BEGIN
    DECLARE v_max_orders INT DEFAULT NULL;
    DECLARE v_existing_orders INT DEFAULT 0;
    DECLARE v_item_count INT DEFAULT 0;
    DECLARE v_valid_items INT DEFAULT 0;
    DECLARE v_updated_items INT DEFAULT 0;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0.00;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        DROP TEMPORARY TABLE IF EXISTS tmp_booking_items;
        RESIGNAL;
    END;

    SET p_booking_id = NULL;
    SET p_token_no = NULL;

    IF p_booking_date IS NULL OR p_booking_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid booking date';
    END IF;

    IF p_payment_mode NOT IN ('UPI', 'COUNTER') THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Invalid payment mode';
    END IF;

    DROP TEMPORARY TABLE IF EXISTS tmp_booking_items;

    CREATE TEMPORARY TABLE tmp_booking_items (
        item_id INT PRIMARY KEY,
        quantity INT NOT NULL,
        CHECK (quantity > 0)
    );

    INSERT INTO tmp_booking_items (item_id, quantity)
    SELECT item_id, quantity
    FROM JSON_TABLE(
        p_items,
        '$[*]' COLUMNS (
            item_id INT PATH '$.item_id',
            quantity INT PATH '$.quantity'
        )
    ) AS jt;

    SELECT COUNT(*) INTO v_item_count
    FROM tmp_booking_items;

    IF v_item_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Booking must contain at least one item';
    END IF;

    START TRANSACTION;

    -- Lock the slot row so simultaneous bookings cannot
    -- exceed its capacity.
    SELECT max_orders INTO v_max_orders
    FROM Time_Slot
    WHERE slot_id = p_slot_id
    FOR UPDATE;

    IF v_max_orders IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pickup slot does not exist';
    END IF;

    SELECT COUNT(*) INTO v_existing_orders
    FROM Booking
    WHERE slot_id = p_slot_id
      AND booking_date = p_booking_date
      AND status IN (
          'PLACED', 'CONFIRMED', 'PREPARING', 'READY'
      );

    IF v_existing_orders >= v_max_orders THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Pickup slot is full';
    END IF;

    -- Validate all requested items and their stock.
    SELECT COUNT(*) INTO v_valid_items
    FROM tmp_booking_items t
    JOIN Menu_Item m ON m.item_id = t.item_id
    JOIN Daily_Stock s
      ON s.item_id = t.item_id
     AND s.stock_date = p_booking_date
    WHERE m.is_available = TRUE
      AND s.qty_remaining >= t.quantity;

    IF v_valid_items <> v_item_count THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'An item is unavailable or stock is insufficient';
    END IF;

    SELECT SUM(t.quantity * m.price) INTO v_total
    FROM tmp_booking_items t
    JOIN Menu_Item m ON m.item_id = t.item_id;

    -- Deduct stock atomically. If any row fails, roll back.
    UPDATE Daily_Stock s
    JOIN tmp_booking_items t ON t.item_id = s.item_id
    SET s.qty_remaining = s.qty_remaining - t.quantity
    WHERE s.stock_date = p_booking_date
      AND s.qty_remaining >= t.quantity;

    SET v_updated_items = ROW_COUNT();

    IF v_updated_items <> v_item_count THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Stock changed; please retry booking';
    END IF;

    INSERT INTO Booking (
        student_id, slot_id, booking_date, status, total_amount
    )
    VALUES (
        p_student_id, p_slot_id, p_booking_date,
        'CONFIRMED', v_total
    );

    SET p_booking_id = LAST_INSERT_ID();

    INSERT INTO Booking_Item (
        booking_id, item_id, quantity, unit_price
    )
    SELECT p_booking_id, t.item_id, t.quantity, m.price
    FROM tmp_booking_items t
    JOIN Menu_Item m ON m.item_id = t.item_id;

    -- Atomically allocate the next daily token.
    INSERT INTO Token_Sequence (token_date, last_token)
    VALUES (p_booking_date, 1)
    ON DUPLICATE KEY UPDATE
        last_token = last_token + 1;

    SELECT last_token INTO p_token_no
    FROM Token_Sequence
    WHERE token_date = p_booking_date
    FOR UPDATE;

    INSERT INTO Queue_Token (
        booking_id, token_date, token_no, queue_status
    )
    VALUES (
        p_booking_id, p_booking_date, p_token_no, 'WAITING'
    );

    INSERT INTO Payment (
        booking_id, mode, amount, pay_status
    )
    VALUES (
        p_booking_id, p_payment_mode, v_total, 'PENDING'
    );

    COMMIT;

    DROP TEMPORARY TABLE IF EXISTS tmp_booking_items;
END$$

DELIMITER ;
