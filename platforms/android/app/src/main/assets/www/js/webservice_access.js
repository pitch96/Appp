var webservice_access = {


    get_centros: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetCentros&user=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_notas_iniciadas_by_user: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetNotasIniciadasByUser&username=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_list_transportes_agendados: function (beforesend, success, error) {

        var user = window.localStorage.getItem("login");
        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListTransportesAgendados&usuario=' + user;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_transporte_agendado: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetTransporteAgendado';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    iniciar_transporte_agendado: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CheckInTransporteAgendado';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },
    iniciar_transporte_dinamico: function (data, beforesend, success, error) {
        console.log("ENTRANDO NO INICIAR TRANSPORTE DINAMICO")
        var domain = window.localStorage.getItem("domain");
        console.log(JSON.stringify(data))
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=CheckInTransporteAgendadoDinamico';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },
    get_dados_cliente_by_nfe: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetDadosClienteByNFE&num_nfe=' + data.num_nfe + '&num_serie=' + data.serie_nfe + '&cnpj=' + data.cnpj;

        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_list_status_transporte: function (beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListStatusTransporte';
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    get_update_data: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetUpdates';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_phone_number: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetContacts';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_whatsapp_number: function (data, beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetContacts';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    get_list_tipo_relacao_recebedores: function (beforesend, success, error) {

        var domain = window.localStorage.getItem("domain");
        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=GetListTipoRelacaoRecebedores';
        this.call_ajax('GET', url, null, beforesend, success, error);
    },

    getLocationAndSendData: function () {
    console.log('getting location periodcly getLocationAndSendData');
        if (window.localStorage.getItem("geo-loc-active") == "1") {

            console.log('Solicitado Verificação de geolocation');
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var last_lng_compare = parseFloat(window.localStorage.getItem("last_lng"));
                    var last_lat_compare = parseFloat(window.localStorage.getItem("last_lat"));
                    var atual_lat_compare = parseFloat(position.coords.latitude);
                    var atual_lng_compare = parseFloat(position.coords.longitude);
                    console.log('storage last ltn', last_lng_compare);
                    console.log('storage last lat', last_lat_compare);
                    console.log('atual last lat', atual_lat_compare);
                    console.log('atual last lat', atual_lng_compare);

                    if (last_lat_compare == atual_lat_compare && last_lng_compare == atual_lng_compare) {
                        console.log('Não enviando porque é igual á ultima localização enviada');
                    } else {
                        // Enviar dados para o servidor em tempo real
                        console.log('Enviado localização', position.coords.latitude, position.coords.longitude);
                        //                        var user = window.localStorage.getItem("login");
                        var user_id = window.localStorage.getItem("user_id");
                        console.log('user_id', user_id);
                        var domain = window.localStorage.getItem("domain");
                        var url = domain + '/scan/example/webservice/ws_portal_transportador.php?request=InsertUserLocation';

                        var form = new FormData();
                        form.append("user", user_id);
                        form.append("latitude", position.coords.latitude);
                        form.append("longitude", position.coords.longitude);
                        form.append("speed", "0");
                        form.append("altitude", "50");
                        form.append("bearing", "0");

                        var settings = {
                            "url": url,
                            "method": "POST",
                            "timeout": 0,
                            "headers": {
                                "apiKey": "78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547",
                            },
                            "processData": false,
                            "mimeType": "multipart/form-data",
                            "contentType": false,
                            "data": form
                        };

                        $.ajax(settings).done(function (response) {
                            console.log('ajax');
                            var obj = JSON.parse(response);
                            if (obj.success === true) {
                                //                                     window.localStorage.setItem("last_lng", "-122.085");
                                //                                     window.localStorage.setItem("last_lat", "37.4319983");
                                window.localStorage.setItem("last_lng", position.coords.longitude);
                                window.localStorage.setItem("last_lat", position.coords.latitude);
                                console.log('reseponseeeeeeeee', position.coords.latitude, position.coords.longitude);
                            } else {
                                console.log('reseponseeeeeeeee2');
                            }
                        });

                    }
                },
                function (error) {
                    console.error("Erro ao obter localização: " + error.message);
                    reject(error); // Rejeita a Promise em caso de erro
                },
                { maximumAge: 1, timeout: 9999, enableHighAccuracy: true }
            );
        }
    },

    call_ajax: function (type, url, data, beforesend, success, error) {
        $.ajax({
            type: type,
            url: url,
            data: data,
            contentType: false,
            cache: false,
            processData: false,
            headers: {
                'apiKey': '78asd4546d4sa687e1d1xzlcknhwyhuWMKPSJDpox8213njdOWnxxipW58547',
            },
            beforeSend: beforesend,
            success: success,
            error: error
        });
    }

}