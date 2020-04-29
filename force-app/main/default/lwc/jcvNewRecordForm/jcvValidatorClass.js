export default class JcvValidatorClass  {
    isGreat(paramJson){

        var param1 =  paramJson.params[0].value;
        var param2 =  paramJson.params[1].value;

          if(param1> param2)
              return true;
          return false;
      }
      isEqual(paramJson){

        var param1 =  paramJson.params[0].value;
        var param2 =  paramJson.params[1].value;

          if(param1 == param2)
              return true;
          return false;
      }
      isLow(paramJson){

        var param1 =  paramJson.params[0].value;
        var param2 =  paramJson.params[1].value;

          if(param1> param2)
              return true;
          return false;
      }
      isNull(paramJson){
        var param1 =  paramJson.params[0].value;
        if(param1 == null || param1 == '' || param1 == undefined)
          return true;
       return false;
      }
      isNotNull(paramJson){
        var param1 =  paramJson.params[0].value;
        if(param1 == null || param1 == '' || param1 == undefined)
          return false;
        return true;
      }
      getTrue(paramJson){
        return true;
      }
      getFalse(paramJson){
        return false;
      }
}