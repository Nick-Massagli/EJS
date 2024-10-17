-- Task 1
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
-- Task 2
UPDATE public.account
SET account_type = 'Admin'
WHERE account_id = 1;
-- Task 3
DELETE FROM public.account
WHERE account_id = '1';
-- Task 4
UPDATE public.inventory
SET inv_description = REPLACE(
        inv_description,
        'the small interiors',
        'a huge interior'
    )
WHERE inv_id = '10';
-- Task 5
SELECT inv_make,
    inv_model,
    inventory.classification_id
FROM public.inventory
    INNER JOIN public.classification ON inventory.classification_id = classification.classification_id
WHERE inventory.classification_id = 2;
-- Task 6
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, 's/', 's/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, 's/', 's/vehicles/');