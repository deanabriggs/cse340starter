-- #1
INSERT INTO public.account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- #2
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;
-- #3
DELETE FROM account
WHERE account_id = 1;
-- #4
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
-- #5
SELECT inv_make,
    inv_model,
    classification_name
FROM classification c
    INNER JOIN inventory i ON c.classification_id = i.classification_id
WHERE classification_name = 'Sport';
-- #6
UPDATE inventory
SET inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/'),
    inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/');