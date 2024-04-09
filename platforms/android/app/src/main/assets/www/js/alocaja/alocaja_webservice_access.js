var alocaja_webservice_access = {



/*    get_api_path: function(){
        return `${this.domain}/${this.api_version}`;
    },*/

    get_historico: function (beforesend, success, error) {

     var url = `nadaainda`;
     this.get_historico_ajax('GET', url, beforesend, success, error);
    },


//    get_entregas_dinamicas: function (beforesend, success, error) {
//
//        var url = `nadaainda`;
//        this.call_ajax('GET', url, beforesend, success, error);
//    },

    get_historico_ajax: function (type, url, beforesend, success, error) {
 var form = new FormData();
    form.append("username", window.localStorage.getItem("login"));
    form.append("origem", "");
    form.append("capacidade", "");
    var domain =  window.localStorage.getItem("domain");
    console.log("dominioo");
    console.log(domain)
    console.log("Chamando API de entregas");
    for (var pair of form.entries()) {
           console.log(pair[0] + ", " + pair[1]);
         }
        $.ajax({
             "url": `${domain}/externo/api/ws/Alocaja/list_transporte_motorista`,
             "method": "POST",
             "timeout": 0,
             "headers": {
               "apiKey": "78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547"
              },
             "processData": false,
             "mimeType": "multipart/form-data",
             "contentType": false,
             "data": form,
            beforeSend: beforesend,
            success: success,
            error: error
        });
    },



    call_ajax: function (type, url, beforesend, success, error) {
    var form = new FormData();
    var capacidade =""
    var origem = ""
    if (window.localStorage.getItem("filter_alocaja_peso") != null && window.localStorage.getItem("filter_alocaja_peso")){

        capacidade = window.localStorage.getItem("filter_alocaja_peso")*1000;
        console.log("capacidade")
        console.log(capacidade)
    }
    if (window.localStorage.getItem("filter_alocaja_cnpj") != null && window.localStorage.getItem("filter_alocaja_cnpj") && window.localStorage.getItem("filter_alocaja_cnpj") != 0) {
        origem = window.localStorage.getItem("filter_alocaja_cnpj");
                console.log("origem")
                console.log(origem)
    }
    form.append("username", window.localStorage.getItem("login"));
    form.append("origem", origem != ""? `${origem}`: "");
    form.append("capacidade", capacidade != ""? `${capacidade}`: "");
    var domain =  window.localStorage.getItem("domain");
    console.log("dominioo");
    console.log(domain)
    

    console.log("Chamando API de entregas");
    for (var pair of form.entries()) {
           console.log(pair[0] + ", " + pair[1]);
         }
        $.ajax({
             "url": `${domain}/externo/api/ws/Alocaja/check_transportes`,
             "method": "POST",
             "timeout": 0,
             "headers": {
               "apiKey": "78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547"
              },
             "processData": false,
             "mimeType": "multipart/form-data",
             "contentType": false,
             "data": form,
            beforeSend: beforesend,
            success: success,
            error: error
        });
    },

}