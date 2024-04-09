var portal_webservice_access = {

    domain: window.localStorage.getItem("domain"),

    get_api_path: function(){
        return `${this.domain}`;
    },
    
    set_status: function (data, success, error) {
        var url =  this.get_api_path() + `/externo/api/ws/Alocaja/set_status_motorista`;
        this.call_ajax('PUT', url, data, success, error);
    },



    call_ajax: function (type, url, data, success, error) {
        $.ajax({
            type: type,
            url: url,
            data: data,
            contentType: false ,
            cache: false,
            processData:false,
            headers: {
                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
            },
            success: success,
            error: error
        });
    }

}