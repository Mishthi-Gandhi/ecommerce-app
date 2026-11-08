const {Schema,model}=require("mongoose")
const cartSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    products:[
        {
            productId:{
                type:Schema.Types.ObjectId,
                ref:"product",
                required:true
            },
            quantity:{
                type:Number,
                default:1,
                min:1
            }
        }
    ]
},{timestamps:true})
const Cart=model("cart",cartSchema);
module.exports=Cart