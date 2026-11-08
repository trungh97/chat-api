-- @param {String} $1:firstUserId
-- @param {String} $2:secondUserId
SELECT
        u.id
FROM
        `User` u
WHERE
        u.id IN (?, ?)
ORDER BY
        u.id
FOR UPDATE
