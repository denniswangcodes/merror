-- Stored lumen totals must be backed by approved reflections received.
UPDATE "User" AS users
SET "totalPoints" = COALESCE((
  SELECT SUM(feedback."points")::integer
  FROM "Feedback" AS feedback
  WHERE feedback."receiverId" = users."id"
    AND feedback."status" = 'APPROVED'
), 0);
