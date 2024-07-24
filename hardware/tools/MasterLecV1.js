const commands = {
    type:1,

    open:{  //timestate, timeSound, time to long open door
        cmd:    1,
        args:   [30,30,50]
    },

    denegate:{  //timestate, timeSound
        cmd:    2,
        args:   [10,10]
    },

    block:{  //timestate, timeSound
        cmd:    3,
        args:   [10,10]
    },
    emergencyOn:{  //timestate, timeSound
        cmd:    4,
        args:   [10,10]
    },
    securityOn:{  //timestate, timeSound
        cmd:    5,
        args:   [10,10]
    },

    slow:{  //timestate, timeSound
        cmd:    6,
        args:   [10,10]
    },

    fast:{  //timestate, timeSound
        cmd:    7,
        args:   [10,10]
    },




    forced:{  //timestate, timeSound
        cmd:    4,
        args:   [10,10,2]
    },

    reconnection:{  //timestate, timeSound
        cmd:    9,
        args:   []
    },  
    
    panicOff:{  //timestate, timeSound
        cmd:    10,
        args:   []
    },
    
    STANDBY:{  //timestate, timeSound
        cmd:    9,
        args:   []
    },

    state_door:{  //timestate, timeSound
        cmd:    8,
        args:   [0,0,0]
    },

    disconnect:{  //timestate, timeSound
        cmd:    3,
        args:   [10,10,8]
    },

    open_motor:{  //timestate, timeSound
        cmd:    1,
        args:   [1,1,0]
    },
    
    close_motor:{  //timestate, timeSound
        cmd:    4,
        args:   [1,1,0]
    },

    open_motor2:{  //timestate, timeSound
        cmd:    11,
        args:   [1,1,0]
    },

    close_motor2:{  //timestate, timeSound
        cmd:    14,
        args:   [1,1,0]
    },
}
const request = {
    statusDevice:{ 
        cmd:    1,
        args:   []
    },

    doorState:{  
        cmd:    2,
        args:   []
    },

    buttonState:{  
        cmd:    3,
        args:   []
    }
}
const config = {
    reset:{
        cmd:    6,
        args:   [0]
    },
    enableSlave:{
        cmd:    3,
        args:   [0]
    },
    disableSlave:{
        cmd:    3,
        args:   [1]
    },
    enableSensor:{
        cmd:    4,
        args:   [0]
    },
    disableSensor:{
        cmd:    4,
        args:   [1]
    }
}
const configBHm = {
    openBH:{
        cmd:    1,
        args:   [0]
    },
    closeBH:{
        cmd:    4,
        args:   [0]
    },
    open2BH:{
        cmd:    11,
        args:   [0]
    },
    close2BH:{
        cmd:    14,
        args:   [0]
    },
    reset:{
        cmd:    121,
        args:   [0]
    },
    enableManual:{
        cmd:    113,
        args:   [0]
    },
    disableManual:{
        cmd:    113,
        args:   [255]
    },
    changeID:{
        cmd:    115,
        args:   [0]
    },
    status_z1:{
        cmd:    122,
        args:   [1]
    },
    status_z2:{
        cmd:    123,
        args:   [1]
    },
    status_soft:{
        cmd:    125,
        args:   [1]
    }

}

module.exports = {
    commands, request, config
}