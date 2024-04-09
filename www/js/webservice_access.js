var webservice_access = {


    get_centros: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetCentros&user=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_notas_iniciadas_by_user: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetNotasIniciadasByUser&username=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_list_transportes_agendados: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListTransportesAgendados&usuario=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_transporte_agendado: function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetTransporteAgendado';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    iniciar_transporte_agendado : function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CheckInTransporteAgendado';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },
    iniciar_transporte_dinamico : function (data, beforesend, success, error) {
        console.log("ENTRANDO NO INICIAR TRANSPORTE DINAMICO")
        var domain =  window.localStorage.getItem("domain");
        console.log(JSON.stringify(data))
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CheckInTransporteAgendadoDinamico';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },
    get_dados_cliente_by_nfe : function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetDadosClienteByNFE&num_nfe=' + data.num_nfe + '&num_serie=' + data.serie_nfe + '&cnpj=' + data.cnpj;

        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_list_status_transporte : function (beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListStatusTransporte';
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_update_data: function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetUpdates';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_phone_number: function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetContacts';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_whatsapp_number: function (data, beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetContacts';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_list_tipo_relacao_recebedores : function (beforesend, success, error) {

        var domain =  window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListTipoRelacaoRecebedores';
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    call_ajax: function (type, url, data, beforesend, success, error) {
        $.ajax({
            type: type,
            url: url,
            data: data,
            contentType: false,
            cache: false,
            processData:false,
            headers: {
                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
            },
            beforeSend: beforesend,
            success: success,
            error: error
        });
    }

}