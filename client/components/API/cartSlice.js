import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
    name: "cart",
    initialState: localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [],
    reducers: {
        setCart: (state, { payload }) => {
            for (let i = 0; i < state.length; i++) {
                if(state[i].productId === payload.productId) {
                    state[i].quantity += payload.quantity;
                    localStorage.setItem("cart", JSON.stringify(state));
                    return;
                }
            }
            state.push({
                productId: payload.productId,
                quantity: payload.quantity,
                productPrice: payload.productPrice,
            });
            localStorage.setItem("cart", JSON.stringify(state));
        },
        updateCart: (state, { payload }) => {
            for (let i = 0; i < state.length; i++) {
                if(state[i].productId === payload.productId) {
                    if (payload.quantity === 0) {
                        state.splice(i, 1);
                        localStorage.setItem("cart", JSON.stringify(state));
                        return;
                    }
                    state[i].quantity = payload.quantity;
                    localStorage.setItem("cart", JSON.stringify(state));
                    return;
                }
            }
        },
        emptyCart: (state) => {
            state.splice(0, state.length);
            localStorage.setItem("cart", JSON.stringify(state));
        }
    },
});

export default cartSlice.reducer;

export const {setCart, updateCart, emptyCart} = cartSlice.actions;

