

cte_configs = {

    emitente_id: function(){
        let emitente_id = window.localStorage.getItem("acesso_cte_id");
        return emitente_id;
    },

    usuario_acessa_cte: function(){
        let acesso_cte = window.localStorage.getItem("acesso_cte");
        console.log(acesso_cte);
        return acesso_cte == "true";
    },

    tpAmb: function(){
        return 1;
    },


}