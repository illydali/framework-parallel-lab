const cartDataLayer = require('../dal/cart_items');

class CartServices {
    constructor(user_id) {
        this.user_id = user_id;
    }

    async getCart() {
        return await cartDataLayer.getCart(this.user_id);
    }

    async addToCart(posterId, quantity) {
        // todo: check if there is enough stock
        // todo: check if the user is eligible for discount
        // todo: for example - you can only buy one type of each category

        // todo: check if the currently logged in user
        // have already added the item to the cart
        let cartItem = await cartDataLayer.getCartItemByUserAndPoster(
            this.user_id, posterId
        )
        if (cartItem) {
           await cartDataLayer.updateCartItemQuantity(this.user_id, 
                    posterId, 
                    cartItem.get('quantity')+quantity)
        } else {
            cartItem = await cartDataLayer.createCartItem(
                this.user_id,
                posterId,
                quantity
            )
            return cartItem;
        }
       
    }

    async updateQuantity(posterId, newQuantity) {
        // todo: check if enough stock exists etc.
        await cartDataLayer.updateCartItemQuantity(this.user_id, posterId, newQuantity);
    }

    async removeFromCart(posterId) {
        await cartDataLayer.removeFromCart(this.user_id, posterId);
    }
}

module.exports = CartServices;