var coleta_webservice_access = {

    domain:  function(){
        return window.localStorage.getItem("domain");
    },


    coletar_notafiscal : function (data, beforesend, success, error) {
        var url = this.domain() + '/externo/api/ws/Aplicativo/ColetarNfe/post';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    coletar_remessa : function (data, beforesend, success, error) {
        var url = this.domain() + '/externo/api/ws/Aplicativo/ColetarRemessa/post';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    coletar_pedido : function (data, beforesend, success, error) {
        var url = this.domain() + '/externo/api/ws/Aplicativo/ColetarPedido/post';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    coletar_manifesto : function (data, beforesend, success, error) {
        var url = this.domain() + '/externo/api/ws/Aplicativo/ColetarManifesto/post';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },

    load_remessa_manifesto : function (data, beforesend, success, error) {
        var url = this.domain() + '/externo/api/ws/aplicativo/check_manifesto/post';
        this.call_ajax('POST', url, data, beforesend, success, error);
    },


    block_coleta_nf : function (beforesend, success, error) {
        var url = 'https://api.portaldotransportador.net/externo/api/ws/aplicativo/block_coleta_nf/post';
        this.call_ajax('POST', url, null, beforesend, success, error);
    },
    block_coleta_manifesto : function (beforesend, success, error) {
        var url = 'https://api.portaldotransportador.net/externo/api/ws/aplicativo/block_coleta_manifesto/post';
        this.call_ajax('POST', url, null, beforesend, success, error);
    },
    block_coleta_remessa : function (beforesend, success, error) {
        var url = 'https://api.portaldotransportador.net/externo/api/ws/aplicativo/block_coleta_remessa/post';
        this.call_ajax('POST', url, null, beforesend, success, error);
    },
    block_coleta_manifesto_bipe : function (beforesend, success, error) {
        var url = 'https://api.portaldotransportador.net/externo/api/ws/aplicativo/block_coleta_manifesto_bipe/post';
        this.call_ajax('POST', url, null, beforesend, success, error);
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
                'ApiKey': '5ad519cd-fb37-4280-9c52-99acabbe6297',
            },
            beforeSend: beforesend,
            success: success,
            error: error
        });
    }

}