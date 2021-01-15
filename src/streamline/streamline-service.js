const StreamlineService = {
    // get calls

    getParts(knex, id) {
        if (id === "all") {
            return knex
                .from("parts")
                .select("id", "description", "stock")
                .where({ isactive: "true" });
        } else if (id === "false") {
            return knex.from("parts").select("id", "description", "stock");
        } else {
            return knex
                .from("parts")
                .select("id", "description", "stock", "machine", "complexity")
                .where({ isactive: "true" })
                .andWhere({ id: id });
        }
    },
    getAssemblies(knex, id) {
        if (id === "all") {
            return knex
                .from("assemblies")
                .select("id", "description")
                .where({ isactive: "true" });
        } else {
            return knex.from("assemblies").select("id", "description");
        }
    },
    getAssemblyContents(knex, id) {
        return knex.raw(
            `select j.partid as partId, p.description, p.machine, p.complexity from joinpartsassemblies j join parts p on p.id = j.partid where j.assemblyid = ${id}`
        );
    },
    getMachines(knex, id) {
        if (id === "all") {
            return knex
                .from("machines")
                .select("id", "name", "type")
                .where({ isactive: "true" });
        } else if (id === "false") {
            return knex.from("machines").select("id", "name", "type");
        }
    },
    getCells(knex, id) {
        if (id === "all") {
            return knex
                .from("cells")
                .select("id", "intra", "inter")
                .where({ isactive: "true" });
        }
        return knex.from("cells").select("id", "intra", "inter");
    },
    getCellContents(knex, id) {
        return knex.raw(
            `select id as machineId, name, type from machines m where m.cellid = ${id} and m.isactive = true`
        );
    },
    getTests(knex) {
        return knex.from("tests").select("id", "rundate", "batchtime");
    },
    getTestAsmContents(knex, id) {
        return knex.raw(
            `select a.id, a.description, jta.cycletime from jointestsassemblies jta join assemblies a on jta.assemblyid = a.id where jta.testid = ${id}`
        );
    },
    getTestMachContents(knex, id) {
        return knex.raw(
            `select m.id, m.name, jtm.utilizationtime from jointestsmachines jtm join machines m on jtm.machineid = m.id where jtm.testid = ${id}`
        );
    },

    // post calls
    addPart(knex, part) {
        return knex
            .insert(part)
            .into("parts")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
    addAssembly(knex, assembly, contents) {
        if (assembly === -1) {
            const { asmContents } = contents;
            return knex
                .insert(asmContents)
                .into("joinpartsassemblies")
                .returning("*")
                .then((rows) => {
                    return rows[0];
                });
        } else {
            return knex
                .insert(assembly)
                .into("assemblies")
                .returning("*")
                .then((rows) => {
                    const asmContents = contents.reduce((acc, cur) => {
                        return [
                            ...acc,
                            { partid: cur, assemblyid: rows[0].id },
                        ];
                    }, []);
                    return { rows, asmContents };
                });
        }
    },
    addMachine(knex, machine) {
        return knex
            .insert(machine)
            .into("machines")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
    addCell(knex, cell) {
        return knex
            .insert(cell)
            .into("cells")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
    addTest(knex, test) {
        return knex
            .insert(test)
            .into("tests")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
    addTestAssemblies(knex, id, data) {
        const plug = data.reduce((acc, val) => {
            return [
                ...acc,
                {
                    testid: id,
                    assemblyid: Object.keys(val)[0],
                    cycletime: Object.values(val)[0],
                },
            ];
        }, []);
        return knex
            .insert(plug)
            .into("jointestsassemblies")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
    addTestMachines(knex, id, data) {
        const plug = data.reduce((acc, val) => {
            return [
                ...acc,
                {
                    testid: id,
                    machineid: val['id'],
                    utilizationtime: val['utilize'],
                },
            ];
        }, []);
        return knex
            .insert(plug)
            .into("jointestsmachines")
            .returning("*")
            .then((rows) => {
                return rows[0];
            });
    },
};

module.exports = StreamlineService;
