App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.

    return App.initWeb3();
  },

  initWeb3: function() {
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
    }else{
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('ErcToken.json', function(json, textStatus) {
      App.contracts.ErcToken = TruffleContract(json);
      App.contracts.ErcToken.setProvider(App.web3Provider);
      return App.rendor();
    });

  },

  rendor: function(){
    var ErcToken;
    web3.eth.getCoinbase(function(err,account){
        if(err === null){
          App.account = account;
          $("#meta_mast_account").text(account);
        }
    });

    App.contracts.ErcToken.deployed().then(function(instance){
        ErcToken = instance;
        return ErcToken.totalSupply();
    }).then(function(totalSupply){
        $("#total_supply").text(totalSupply.toNumber());
        $("#buy_token_count").attr("max",totalSupply.toNumber());
        return ErcToken.initiatorAddress();
    }).then(function(initiatorAddress){
      console.log(initiatorAddress);
      App.initiatorAddress = initiatorAddress;
      return ErcToken.balanceOf(App.account);
    }).then(function(currentAccountBalance){
      $("#meta_mast_account_balance").text(currentAccountBalance.toNumber());
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    //$(document).on('click', '.btn-adopt', App.handleAdopt);
    $(document).on('submit', '#search_form', App.handleSearch);
    $(document).on('submit', '#buy_form', App.TransferToken);
    $(document).on('submit','#transfer_form',App.TransferToken);
  },

  TransferToken: function(e){
    e.preventDefault();
    var form = e.target.id;

    if(form == "buy_form"){
      var to = App.account;
      var from = App.initiatorAddress;
      var token = $("#buy_token_count").val().trim();
    }else{
      var to = $("#transfer_account").val().trim();
      var from = App.account;
      var token = $("#transfer_token_count").val().trim();
    }

    App.contracts.ErcToken.deployed().then(function(instance){
      return instance.transfer(to,token,{from:from});
    }).then(function(result){
      $("#"+form).append(`
        <div class="alert alert-success">
          <strong>Success!</strong>
        </div>
      `);

      setTimeout(function(){
        $("#"+form).find(".alert").remove();
      },2000);

    }).catch(function(error) {
      console.log(error);
    });
  },

  handleSearch: function(e){
      e.preventDefault();
      var s_account = $("#s_account").val().trim();
      if(!s_account){
        alert("Enter a account to search");
        $("#s_account").focus();
        return false;
      }
      $("#s_btn").find("i").removeClass("fa-search").addClass("fa-circle-o-notch fa-spin");
      //if(web3.utils.isAddress(s_account)){
        App.contracts.ErcToken.deployed().then(function(instance){
          return instance.balanceOf(s_account);
        }).then(function(balance){
          $("#search_result").show();
          $("#s_tokens").text(balance);
          $("#s_btn").find("i").removeClass("fa-circle-o-notch fa-spin").addClass("fa-search");
        });
      //}
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
