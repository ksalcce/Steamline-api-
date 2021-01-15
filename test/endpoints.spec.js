const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const supertest = require("supertest");

describe("Streamline Endpoints", function () {
    let db;

    before("make knex instance", () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DATABASE_URL,
        });
        app.set("db", db);
    });

    after("disconnect from db", () => db.destroy());

    before("cleanup", () => {
        return app.get("db").raw(`TRUNCATE parts,
assemblies,
joinPartsAssemblies,
machines,
cells,
tests,
joinTestsAssemblies,
joinTestsMachines RESTART IDENTITY CASCADE;`);
    });

    before("clean insert", () => {
        return app.get("db").raw(`INSERT INTO parts (
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
	('GREY', 'ROUTING');`);
    });

    describe("GET /parts", () => {
        const partsAll = [
            {
                id: 1,
                description: "123/234 GLAND",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 2,
                description: "123 SLEEVE",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 3,
                description: "123 LOCKRING",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 4,
                description: "123 GLAND",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 5,
                description: "234 SLEEVE",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 6,
                description: "234 HOUSING",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 7,
                description: "234 LOCKRING",
                stock: "316 UNS S31600, ASTM A511",
            },
        ];

        it("should return most if using /all", () => {
            return supertest(app).get("/parts/all").expect(200, partsAll);
        });

        const partsFalse = [
            {
                id: 1,
                description: "123/234 GLAND",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 2,
                description: "123 SLEEVE",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 3,
                description: "123 LOCKRING",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 4,
                description: "123 GLAND",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 5,
                description: "234 SLEEVE",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 6,
                description: "234 HOUSING",
                stock: "316 UNS S31600, ASTM A276",
            },
            {
                id: 7,
                description: "234 LOCKRING",
                stock: "316 UNS S31600, ASTM A511",
            },
            {
                id: 8,
                description: "234 LOCKRING",
                stock: "316 UNS S31600, ASTM A276",
            },
        ];

        it("should return all if using /false", () => {
            return supertest(app).get("/parts/false").expect(200, partsFalse);
        });

        const partsOne = [
            {
                id: 1,
                description: "123/234 GLAND",
                stock: "316 UNS S31600, ASTM A276",
                machine: "MT",
                complexity: "4.5,2",
            },
        ];

        it("should return specific information if it gets a specific id", () => {
            return supertest(app).get("/parts/1").expect(200, partsOne);
        });

        it("should fail if it gets nonsense", () => {
            return supertest(app).get("/parts/nonsense").expect(200, "Invalid");
        });
    });

    describe("GET /assemblies", () => {
        const asmAll = [
            { id: 1, description: "123 ASSEMBLY A" },
            { id: 2, description: "123 ASSEMBLY B" },
        ];

        it("should return most if using /all", () => {
            return supertest(app).get("/assemblies/all").expect(200, asmAll);
        });

        const asmFalse = [
            { id: 1, description: "123 ASSEMBLY A" },
            { id: 2, description: "123 ASSEMBLY B" },
            { id: 3, description: "234 ASSEMBLY" },
        ];

        it("should return all if using /false", () => {
            return supertest(app)
                .get("/assemblies/false")
                .expect(200, asmFalse);
        });

        const asmOne = [
            {
                partid: 1,
                description: "123/234 GLAND",
                machine: "MT",
                complexity: "4.5,2",
            },
            {
                partid: 2,
                description: "123 SLEEVE",
                machine: "TM",
                complexity: "3,1",
            },
            {
                partid: 3,
                description: "123 LOCKRING",
                machine: "T",
                complexity: "2.5",
            },
        ];

        it("should return specific information if it gets a specific id", () => {
            return supertest(app).get("/assemblies/1").expect(200, asmOne);
        });

        it("should fail if it gets nonsense", () => {
            return supertest(app)
                .get("/assemblies/nonsense")
                .expect(200, "Invalid");
        });
    });

    describe("GET /machines", () => {
        const machAll = [
            { id: 1, name: "HAAS", type: "M" },
            { id: 2, name: "OKUMA", type: "M" },
            { id: 3, name: "MAZAK", type: "M" },
            { id: 4, name: "DELTA", type: "T" },
            { id: 5, name: "JET", type: "T" },
        ];

        it("should return true machines if /all", () => {
            return supertest(app).get("/machines/all").expect(200, machAll);
        });

        const machFalse = [
            { id: 1, name: "HAAS", type: "M" },
            { id: 2, name: "OKUMA", type: "M" },
            { id: 3, name: "MAZAK", type: "M" },
            { id: 4, name: "DELTA", type: "T" },
            { id: 5, name: "JET", type: "T" },
        ];

        it("should return all if using /false", () => {
            return supertest(app).get("/machines/false").expect(200, machFalse);
        });

        it("should return invalid if else", () => {
            return supertest(app).get("/machines/ni").expect(200, "Invalid ID");
        });
    });

    describe("GET /tests", () => {
        const testAll = [
            { id: 1, rundate: "2020-07-12T04:00:00.000Z", batchtime: 12.4 },
            { id: 2, rundate: "2020-07-12T04:00:00.000Z", batchtime: 8.2 },
        ];

        it("should return all tests if /all", () => {
            return supertest(app).get("/tests/all").expect(200, testAll);
        });

        const testOne = {
            testAsm: [
                { id: 1, description: "123 ASSEMBLY A", cycletime: 6.2 },
                { id: 2, description: "123 ASSEMBLY B", cycletime: 6.2 },
            ],
            testMach: [
                { id: 1, name: "HAAS", utilizationtime: 3.2 },
                { id: 2, name: "OKUMA", utilizationtime: 3 },
                { id: 4, name: "DELTA", utilizationtime: 3.2 },
                { id: 5, name: "JET", utilizationtime: 5 },
            ],
        };

        it("should return particulars if a specific id", () => {
            return supertest(app).get("/tests/1").expect(200, testOne);
        });

        it("should return invalid if else", () => {
            return supertest(app).get("/tests/nope").expect(200, "Invalid ID");
        });
    });

    describe("POST endpoints", () => {
        it("should add a new part to the database and respond with information", () => {
            return supertest(app)
                .post("/parts")
                .send({
                    description: "test",
                    stock: "test",
                    machine: "M",
                    complexity: 1.5,
                    isactive: true,
                })
                .expect(201);
        });

        it("should add a new assembly to the database and respond with information", () => {
            return supertest(app)
                .post("/assemblies")
                .send({
                    description: "test",
                    contents: [1],
                })
                .expect(201);
        });

        it("should add a new machine to the database and respond with information", () => {
            return supertest(app)
                .post("/machines")
                .send({
                    name: "test",
                    type: "M",
                    cellid: 0,
                })
                .expect(201);
        });

        it("should add a new test to the database and respond with information", () => {
            return supertest(app)
                .post("/tests")
                .send({
                    contents: [1, 2],
                })
                .expect(201);
        });
    });
});
