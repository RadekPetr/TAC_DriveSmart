window.Namespace = {
    Register: function(_Name) {
        var chk = false;
        var cob = "";
        var spc = _Name.split(".");
        for (var i = 0; i < spc.length; i++) {
            if (cob != "") {
                cob += ".";
            }
            cob += spc[i];
            chk = this.Exists(cob);
            if (!chk) {
                this.Create(cob);
            }
        }
        if (chk) {
            throw "Namespace: " + _Name + " is already defined.";
        }
    },
    Create: function(_Src) {
        eval("window." + _Src + " = new Object();");
    },
    Exists: function(_Src) {
        eval("var NE = false; try{if(" + _Src + "){NE = true;}else{NE = false;}}catch(err){NE=false;}");
        return NE;
    }
}