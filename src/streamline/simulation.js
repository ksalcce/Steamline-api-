const simulation = (input) => {
    const components = input.compList;
    const machines = input.machList;

    // grabs all parts and flattens them into one long list of parts to process
	let fullParts = Object.values(components);
    for (let i = 0; i < fullParts.length; i++) {
        for (let j = 0; j < fullParts[i].length; j++) {
            fullParts[i][j]["asm"] = Object.keys(components)[i];
        }
    }
	fullParts=fullParts.flat()

    // modifies the long parts list into the format needed to process
	const impParts = fullParts.map((val) => {
        return {
            id: val.partid,
            fmach: val.machine.split("")[0],
            fcomp: Number(val.complexity.split(",")[0]),
            smach: val.machine.split("")[1] ? val.machine.split("")[1] : "",
            scomp: val.complexity.split(",")[1]
                ? Number(val.complexity.split(",")[1])
                : 0,
            asm: val.asm,
        };
    });

    // splits the parts list into two based on what the first required operation is for the part
	const millQueue = impParts
        .filter((val) => val.fmach === "M")
        .sort((a, b) => b.fcomp - a.fcomp);
    const latheQueue = impParts
        .filter((val) => val.fmach === "T")
        .sort((a, b) => b.fcomp - a.fcomp);

    // formats the list of the machines into the form required for the simulation
	const fullMach = machines.map((val) => {
        return {
            id: val.id,
            type: val.type,
            inUse: false,
            utilize: 0,
            slot: [],
        };
    });

    // runs such that each 0.1 (imagined as minutes) the situation is re-evaluated
	let timer = 0;
    let completed = [];
	// used to indicate a component has been earmarked for a particular assembly
	let claimFlag = Object.keys(components).reduce((acc, val) => {
        return { ...acc, [val]: false };
    }, {});
    let asmTime = [];

    while (completed.length != fullParts.length && timer < 20) {
        timer += 0.1;

        for (let i = 0; i < fullMach.length; i++) {
            // checking for empty machines. If empty, check to see if there is
            // something in queue that needs work. Pop off the queue to the
            // machine slot
            if (!fullMach[i].inUse) {
                if (fullMach[i].type == "M") {
                    if (millQueue.length > 0) {
                        fullMach[i].slot.push(millQueue.pop());
                        fullMach[i].inUse = true;
                    }
                } else {
                    if (latheQueue.length > 0) {
                        fullMach[i].slot.push(latheQueue.pop());
                        fullMach[i].inUse = true;
                    }
                }
            }

            // increasing utilization and decreasing remaining time on a component
            if (fullMach[i].inUse) {
                fullMach[i].utilize += 0.1;
                fullMach[i].slot[0].fcomp -= 0.1;
            }

            // removing components either to the next queue or to the completed bin
            // once they're done
            if (
                fullMach[i].slot.length == 1 &&
                fullMach[i].slot[0].fcomp <= 0
            ) {
                if (fullMach[i].slot.smach != "") {
                    fullMach[i].slot.fmach = fullMach[i].slot.smach;
                    fullMach[i].slot.smach = "";
                    fullMach[i].slot.fcomp = fullMach[i].slot.scomp;
                    // queue switch
                    if (fullMach[i].slot.fmach == "M") {
                        millQueue.push(fullMach[i].slot.pop());
                    } else {
                        latheQueue.push(fullMach[i].slot.pop());
                    }
                } else {
                    completed.push(fullMach[i].slot.pop());
                }
                fullMach[i].inUse = false;
            }
        }
        // having the assemblies grab their components for timing

        for (let i = 0; i < Object.keys(components).length; i++) {
            let completedCompare = completed.filter(
                (val) => val.asm == Object.keys(components)[i]
            );
            // handling indications for when during the runtime an assembly came off the line
			if (
                completedCompare.length ===
                    Object.values(components)[i].length &&
                !claimFlag[i]
            ) {
                asmTime.push({
                    [Object.keys(components)[i]]: timer.toFixed(1),
                });
                claimFlag[i] = true;
            }
        }
    }
    const batch = timer.toFixed(1);
    const utilization = fullMach.map((val) => {
        return { id: val.id, utilize: val.utilize.toFixed(1) };
    });
    const cycle = asmTime;
    return { batch, utilization, cycle };
};

module.exports = simulation;
