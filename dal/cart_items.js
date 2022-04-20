const { CartItem } = require('../models');

const getCart = async (userId) => {
    return await CartItem.collection()
    .where({
        'user_id' : userId
    }).fetch({
        require: false,
        withRelated: ['poster']
    })
}

/* check whether the user has added an item to the cart */
const getCartItemByUserAndPoster = async (userId, posterId) => {
    return await CartItem.where({
        'user_id': userId,
        'poster_id' : posterId
    }).fetch({
        require: false
    });
}

/* add a cart item */
async function createCartItem(userId, posterId, quantity) {
    // an instance of a model represents one row in the table
    // so to create a new row, simply create a new instance
    // of the model
    let cartItem = new CartItem({
        'user_id': userId,
        'poster_Id': posterId,
        'quantity': quantity
    });

    await cartItem.save(); // save the new row to the database
    return cartItem;
}

async function updateCartItemQuantity(userId, posterId, quantity) {
    let cartItem = await getCartItemByUserAndPoster(userId, posterId);
    cartItem.set('quantity', quantity);
    await cartItem.save();
    return cartItem;
}

async function removeFromCart(userId, posterId) {
    let cartItem = await getCartItemByUserAndPoster(userId, posterId);
    await cartItem.destroy();
}

module.exports = {
    getCart,
    getCartItemByUserAndPoster,
    createCartItem,
    updateCartItemQuantity,
    removeFromCart

}