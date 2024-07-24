const connections = {};

exports.addConnection = (id, socket) =>{
    //search in array
    connections[id] = socket;
}

exports.get = (id) => { return connections[id]};