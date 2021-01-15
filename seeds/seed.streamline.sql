INSERT INTO parts (
		description,
		stock,
		machine,
		complexity,
		isActive
	)
VALUES (
		'123/234 GLAND',
		'316 UNS S31600, ASTM A276',
		'MT',
		'4.5,2',
		TRUE
	),
	(
		'123 SLEEVE',
		'316 UNS S31600, ASTM A511',
		'TM',
		'3,1',
		TRUE
	),
	(
		'123 LOCKRING',
		'316 UNS S31600, ASTM A511',
		'T',
		'2.5',
		TRUE
	),
	(
		'123 GLAND',
		'316 UNS S31600, ASTM A276',
		'MT',
		'3.5,1.2',
		TRUE
	),
	(
		'234 SLEEVE',
		'316 UNS S31600, ASTM A511',
		'T',
		'3.1',
		TRUE
	),
	(
		'234 HOUSING',
		'316 UNS S31600, ASTM A276',
		'T',
		'2.8',
		TRUE
	),
	(
		'234 LOCKRING',
		'316 UNS S31600, ASTM A511',
		'T',
		'4.1',
		TRUE
	),
	(
		'234 LOCKRING',
		'316 UNS S31600, ASTM A276',
		'T',
		'4.2',
		FALSE
	);
INSERT INTO assemblies (description, isActive)
VALUES ('123 ASSEMBLY A', TRUE),
	('123 ASSEMBLY B', TRUE),
	('234 ASSEMBLY', FALSE);
INSERT INTO joinPartsAssemblies (partId, assemblyId)
VALUES (1, 1),
	(1, 3),
	(2, 1),
	(2, 2),
	(3, 1),
	(3, 2),
	(4, 2),
	(5, 3),
	(6, 3),
	(7, 3),
	(8, 3);
INSERT INTO machines (name, type, cellId, isActive)
VALUES ('HAAS', 'M', 1, TRUE),
	('OKUMA', 'M', 1, TRUE),
	('MAZAK', 'M', 2, TRUE),
	('DELTA', 'T', 1, TRUE),
	('JET', 'T', 2, TRUE);
INSERT INTO cells (intra, inter, isActive)
VALUES (1, 2, TRUE),
	(1, 3, TRUE);
INSERT INTO tests (runDate, batchTime)
VALUES (NOW(), 12.4),
	(NOW(), 8.2);
INSERT INTO joinTestsAssemblies (testId, assemblyId, cycleTime)
VALUES (1, 1, 6.2),
	(1, 2, 6.2),
	(2, 2, 6.2),
	(2, 3, 2.0);
INSERT INTO joinTestsMachines (testId, machineId, utilizationTime)
VALUES (1, 1, 3.2),
	(1, 4, 3.2),
	(1, 2, 3.0),
	(1, 5, 5.0),
	(2, 1, 2.3),
	(2, 4, 2.4),
	(2, 2, 3.4),
	(2, 5, 3.3);
INSERT INTO users (username, roles)
VALUES ('GREY', 'PDM'),
	('GREY', 'MFG'),
	('GREY', 'ROUTING');