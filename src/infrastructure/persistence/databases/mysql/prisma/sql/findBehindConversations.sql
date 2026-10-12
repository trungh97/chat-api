SELECT
        c.*,
        p.id as participant_id
FROM
        `Conversation` c
        JOIN `Participant` p ON p.`conversation_id` = c.id
WHERE
        p.`user_id` = ?
        AND (
                p.`last_received_message_id` != c.`last_message_id`
                OR p.`last_received_message_id` IS NULL
        )