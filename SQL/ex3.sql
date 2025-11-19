INSERT INTO Salesperson (
    SIN,
    fName,
    lName,
    commission,
    salary
) VALUES (
    '12345',
    'John',
    'Doe',
    0.05,
    50000
);

INSERT INTO Salesperson
SET
    SIN = '67890',
    fName = 'Jane',
    lName = 'Doe',
    commission = 0.05,
    salary = 50000;

INSERT INTO Manager (
    SIN,
    fName,
    lName,
    salary,
    bonus
) SELECT
    SIN,
    fName,
    lName,
    salary,
    salary * 0.1
FROM Salesperson
WHERE SIN = '12345';