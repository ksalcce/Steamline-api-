const express = require("express");
const xss = require("xss");
const logger = require("../logger");
const StreamlineService = require("./streamline-service");
const Simulation = require("./simulation");

const streamlineRouter = express.Router();
const bodyParser = express.json();

const serializePart = (part) => ({
    id: part.id,
    description: xss(part.description),
    stock: xss(part.stock),
    machine: xss(part.machine),
    complexity: Number(part.complexity),
    isactive: part.isactive,
});

const serializeAssembly = (assembly) => ({
    id: assembly.id,
    description: xss(assembly.description),
    isactive: assembly.isactive,
});

const serializeMachine = (machine) => ({
    id: machine.id,
    name: xss(machine.name),
    type: xss(machine.type),
    cellid: Number(machine.cellid),
    isactive: machine.isactive,
});

const serializeCell = (cell) => ({
    id: cell.id,
    intra: cell.intra,
    inter: cell.inter,
    isactive: cell.isactive,
});

const serializeTest = (test) => ({
    id: test.id,
    rundate: test.rundate,
    batchtime: test.batchtime,
});

streamlineRouter
    .route("/parts/")
    .post(bodyParser, ({ body, app }, res, next) => {
        const { description, stock, machine, complexity } = body;
        const newPart = {
            description,
            stock,
            machine,
            complexity,
            isactive: true,
        };

        StreamlineService.addPart(app.get("db"), newPart)
            .then((part) => {
                logger.info(`Part id ${part.id} created.`);
                res.status(201)
                    .location(`/parts/${part.id}`)
                    .json(serializePart(part));
            })
            .catch(next);
    });

streamlineRouter
    .route("/parts/:partId")
    .get(({ params: { partId }, app }, res, next) => {
        if (partId == "all" || partId == "false" || /\d/.test(partId)) {
            StreamlineService.getParts(app.get("db"), partId)
                .then((data) => {
                    res.json(data);
                })
                .catch(next);
        } else {
            res.json("Invalid");
        }
    });

streamlineRouter
    .route("/assemblies/")
    .post(bodyParser, ({ body, app }, res, next) => {
        const { description, contents } = body;
        const newAssembly = { description, isactive: true };

        StreamlineService.addAssembly(app.get("db"), newAssembly, contents)
            .then((assembly) => {
                const asm = assembly.rows[0];
                StreamlineService.addAssembly(app.get("db"), -1, {
                    asmContents: assembly.asmContents,
                }).then(() => {
                    logger.info(`Assembly id ${asm.id} created.`);
                    res.status(201)
                        .location(`/assemblies/${asm.id}`)
                        .json(serializeAssembly(asm));
                });
            })
            .catch(next);
    });

streamlineRouter
    .route("/assemblies/:assemblyId")
    .get(({ params: { assemblyId }, app }, res, next) => {
        if (assemblyId === "all" || assemblyId === "false") {
            StreamlineService.getAssemblies(app.get("db"), assemblyId)
                .then((data) => {
                    res.json(data);
                })
                .catch(next);
        } else if (/\d/.test(assemblyId)) {
            StreamlineService.getAssemblyContents(app.get("db"), assemblyId)
                .then((data) => {
                    res.json(data.rows);
                })
                .catch(next);
        } else {
            res.json("Invalid");
        }
    });

streamlineRouter
    .route("/machines")
    .post(bodyParser, ({ body, app }, res, next) => {
        const { name, type, cellid } = body;
        const newMachine = {
            name,
            type,
            cellid,
            isactive: true,
        };

        StreamlineService.addMachine(app.get("db"), newMachine)
            .then((machine) => {
                logger.info(`Machine id ${machine.id} created.`);
                res.status(201)
                    .location(`/machines/${machine.id}`)
                    .json(serializeMachine(machine));
            })
            .catch(next);
    });

streamlineRouter
    .route("/machines/:machineId")
    .get(({ params: { machineId }, app }, res, next) => {
        if (machineId === "all" || machineId === "false") {
            StreamlineService.getMachines(app.get("db"), machineId)
                .then((data) => {
                    res.json(data);
                })
                .catch(next);
        } else {
            res.json("Invalid ID");
        }
    });

streamlineRouter
    .route("/cells")
    .post(bodyParser, ({ body, app }, res, next) => {
        const { intra, inter } = body;
        const newCell = {
            intra,
            inter,
            isactive: true,
        };

        StreamlineService.addCell(app.get("db"), newCell)
            .then((cell) => {
                logger.info(`Cell id ${cell.id} created.`);
                res.status(201)
                    .location(`/cells/${cell.id}`)
                    .json(serializeCell(cell));
            })
            .catch(next);
    });

streamlineRouter
    .route("/cells/:cellId")
    .get(({ params: { cellId }, app }, res, next) => {
        if (cellId === "all" || cellId === "false") {
            StreamlineService.getCells(app.get("db"), cellId)
                .then((data) => {
                    res.json(data);
                })
                .catch(next);
        } else {
            StreamlineService.getCellContents(app.get("db"), cellId)
                .then((data) => {
                    res.json(data.rows);
                })
                .catch(next);
        }
    });

// test generation
streamlineRouter
    .route("/tests/")
    .post(bodyParser, ({ body, app }, res, next) => {
        const { contents } = body;

        // grabs all the assembly contents for the current test
        const assemblyList = async (asm) => {
            return Promise.all(
                asm.map((val) => {
                    return StreamlineService.getAssemblyContents(
                        app.get("db"),
                        val
                    )
                        .then((data) => {
                            return data.rows;
                        })
                        .catch(next);
                })
            );
        };

        // grabs all the machines and adds the components to it
        const combMach = (compList) => {
            return StreamlineService.getMachines(app.get("db"), "all")
                .then((machList) => {
                    return { compList, machList };
                })
                .catch(next);
        };

        // adding all of the data generated by the test to the database
        const testSuite = async (id, utilization, cycle, rest) => {
            return [
                rest,
                StreamlineService.addTestAssemblies(app.get("db"), id, cycle)
                    .then((data) => {
                        return data.rows;
                    })
                    .catch(next),
                StreamlineService.addTestMachines(
                    app.get("db"),
                    id,
                    utilization
                )
                    .then((data) => {
                        return data.rows;
                    })
                    .catch(next),
            ];
        };

        assemblyList(contents)
            .then((data) => {
                let partList = data.reduce((acc, cur, ind) => {
                    return { ...acc, [contents[ind]]: cur };
                }, {});
                return combMach(partList);
            })
            .then((data) => {
                // runs the simulation of included assemblies on all machines
                const sim = Simulation(data);
                const { batch, utilization, cycle } = sim;
                const rundate = new Date().toISOString().split("T")[0];
                StreamlineService.addTest(app.get("db"), {
                    rundate,
                    batchtime: batch,
                })
                    .then((data) => {
                        return testSuite(data.id, utilization, cycle, data);
                    })
                    .then((data) => {
                        logger.info(`Test id ${data[0].id} created.`);
                        res.status(201)
                            .location(`/tests/${data[0].id}`)
                            .json(serializeTest(data[0]));
                    });
            });
    });

streamlineRouter
    .route("/tests/:testId")
    .get(({ params: { testId }, app }, res, next) => {
        if (testId === "all") {
            StreamlineService.getTests(app.get("db"))
                .then((data) => {
                    res.json(data);
                })
                .catch(next);
        } else if (/\d/.test(testId)) {
            Promise.all([
                StreamlineService.getTestAsmContents(app.get("db"), testId),
                StreamlineService.getTestMachContents(app.get("db"), testId),
            ])
                .then(([asmRes, machRes]) => {
                    const testAsm = asmRes.rows;
                    const testMach = machRes.rows;

                    res.json({ testAsm, testMach });
                })
                .catch(next);
        } else {
			res.json('Invalid ID')
		}
    });

streamlineRouter
    .route("/tests/asm/:testId")
    .get(({ params: { testId }, app }, res, next) => {
        StreamlineService.getTestAsmContents(app.get("db"), testId)
            .then((data) => {
                res.json(data.rows);
            })
            .catch(next);
    });

streamlineRouter
    .route("/tests/mach/:testId")
    .get(({ params: { testId }, app }, res, next) => {
        StreamlineService.getTestMachContents(app.get("db"), testId)
            .then((data) => {
                res.json(data.rows);
            })
            .catch(next);
    });

module.exports = streamlineRouter;
