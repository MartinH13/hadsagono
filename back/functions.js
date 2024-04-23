class Functions {
    static myStaticMethod() {
        // Code for the static method
    }

    static anotherStaticMethod() {
        // Code for another static method
    }

    static possibleMoves = {
        "0,0" : [m.e, m.s],
        "0,1" : [m.n, m.ne, m.e, m.s],
        "0,2" : [m.n, m.ne, m.e, m.s],
        "0,3" : [m.n, m.ne, m.e, m.s],
        "0,4" : [m.n, m.ne, m.e, m.s],
        "0,5" : [m.n, m.ne],

        "1,0" : [m.e, m.se, m.s, m.sw, m.w],
        "1,1" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "1,2" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "1,3" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "1,4" : [m.n, m.e, m.se, m.sw, m.w],

        "2,0" : [m.e, m.s, m.w],
        "2,1" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
        "2,2" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
        "2,3" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
        "2,4" : [m.n, m.ne, m.e, m.s, m.w, m.nw],
        "2,5" : [m.n, m.ne, m.nw],

        "3,0" : [m.e, m.se, m.s, m.sw, m.w],
        "3,1" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "3,2" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "3,3" : [m.n, m.e, m.se, m.s, m.sw, m.w],
        "3,4" : [m.n, m.e, m.se, m.sw, m.w],

        "4,0" : [m.s, m.w],
        "4,1" : [m.n, m.s, m.w, m.nw],
        "4,2" : [m.n, m.s, m.w, m.nw],
        "4,3" : [m.n, m.s, m.w, m.nw],
        "4,4" : [m.n, m.s, m.w, m.nw],
        "4,5" : [m.n, m.nw]

    }

    static m = {
        n : [0,-1],
        ne : [1,-1],
        e : [1,0],
        se : [1,1],
        s : [0,1],
        sw : [-1,1],
        w : [-1,0],
        nw : [-1,-1],
    }
}

module.exports = Functions;