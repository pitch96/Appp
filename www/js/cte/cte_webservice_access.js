var cte_webservice_access = {

    domain: 'https://cte.portaldotransportador.com',
    
    buscar_nfe: function (data, beforesend, success, error) {

        //nota, serie, cnpj
        var url =  this.domain + '/Api/buscarNotaLocal/get/?num_nfe=' + data.num_nfe + '&serie_nfe=' + data.serie_nfe
            + '&cnpj=' + data.cnpj;

        this.call_ajax('GET', url, data, beforesend, success, error);
    },

    get_centros: function (data, beforesend, success, error) {

        var url =  this.domain + '/Api/centros/get/?emitente_id=' + data.emitente_id;
        this.call_ajax('GET', url, null, beforesend, success, error);
    },


    get_resumo_cte: function (data, beforesend, success, error) {

        var url =  this.domain + '/Api/resumoCte/post/';
        this.call_ajax('POST', url,  data  , beforesend, success, error );
    },

    /*emitir_cte: function (data, beforesend, success, error) {

        var url =  this.domain + '/webservice/MakeCte/Construir/post';
        this.call_ajax('POST', url,  data , beforesend, success, error );
    },*/

    emitir_cte: function (data, beforesend, success, error) {
        //Emitir CTE portal do transportador (Leroy)
        let url = "https://prd.portaldotransportador.com/externo/api/ws/aplicativo/emitir_cte";
       // var url =  this.domain + '/webservice/Portal/emitir_cte/post';
        this.call_ajax('POST', url,  data , beforesend, success, error );
    },

    get_status_sefaz_cte: function (data, beforesend, success, error) {

        var url =  this.domain + '/Api/statusSefaz/post/';
        this.call_ajax('POST', url,  data  , beforesend, success, error );
    },

    get_dados_emissor_cte: function (data, beforesend, success, error) {

        var url =  this.domain + '/Api/carregarDados/post/';
        this.call_ajax('POST', url,  data  , beforesend, success, error );
    },

    get_lista_cte: function (data, beforesend, success, error) {
        var url =  this.domain + '/Api/getListaCte/get/?emitente_id=' + data.emitente_id + '&tpAmb=' + data.tpAmb + '&usuario_emissao=' + data.usuario_emissao + '&limit=' + data.limit;
        this.call_ajax('GET', url,  data  , beforesend, success, error );
    },

    get_cte_by_nfe: function (data, beforesend, success, error) {
        var url =  this.domain + '/Api/cteByNfe/get/?emitente_id=' + data.emitente_id + '&tpAmb=' + data.tpAmb + '&num_nfe=' + data.num_nfe + '&serie_nfe=' + data.serie_nfe + '&cnpj=' + data.cnpj;
        this.call_ajax('GET', url,  data  , beforesend, success, error );
    },

    get_cte_status: function (data, beforesend, success, error) {
        var url =  this.domain + '/webservice/CteMobile/get_cte_status/get/?emitente_id=' + data.emitente_id + '&tpAmb=' + data.tpAmb + '&chave=' + data.chave;
        this.call_ajax('GET', url,  data  , beforesend, success, error );
    },




    call_ajax: function (type, url, data, beforesend, success, error) {
        $.ajax({
            type: type,
            url: url,
            data: data,
            contentType: false ,
            cache: false,
            processData:false,
            headers: {
                'apiKey': '5c4a935a-7268-4648-835a-99167cdac1b6',
            },
            beforeSend: beforesend,
            success: success,
            error: error
        });
    }

}