import React, { useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { useGetUserWithCartQuery } from '../API/mindfulHarvestApi';
import { useGetUserCartQuery } from '../API/mindfulHarvestApi';
import { useCreateNewOrderMutation } from '../API/mindfulHarvestApi';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { emptyCart } from '../API/cartSlice';
import CartItem from './CartItem';
import GuestCartItem from './GuestCartItem';
import Typography from '@mui/material/Typography';
import { Paper } from "@mui/material";

const Cart = () => {
  const token = useSelector((state) => state.token);
  const guestCart = useSelector((state) => state.cart);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  if (token) {
    const [createOrder] = useCreateNewOrderMutation();
    const { data, error: userError, isLoading: userIsLoading } = useGetUserWithCartQuery();
    const { data: cartWithProduct, error: cartWithProductError, isLoading: cartWithProductLoading } = useGetUserCartQuery();

    const [cartTotal, setCartToal] = useState(null);

    if (userIsLoading) {
      return <CircularProgress sx={{ color: 'black', marginTop: '40%', marginLeft: '40%' }} size={75} />;
    }
    if (userError || !data) {
      return <div style={{ color: 'red' }}>Unable to Get User with Cart</div>;
    }

    if (data.cart === null) {
      return <p style={{ color: '#777' }}>No cart present to display.</p>;
    }

    const cartWithItems = data.cart.items;

    //handling getting cart with products error and loading states
    if (cartWithProductLoading) {
      return <CircularProgress sx={{ color: 'black', marginTop: '40%', marginLeft: '40%' }} size={75} />
    };
    if (cartWithProductError || !cartWithProduct) {
      return <div>Unable to get cart with product info</div>
    }

    //function to calculate total price for cart 
    async function calculatingCartTotal() {
      const totalForEachCartItem = cartWithProduct.items.map((item) => {
        return (
          item.quantity * item.product.price
        )
      });

      const priceForEachCartItemResolved = await Promise.all(totalForEachCartItem);
      console.log(priceForEachCartItemResolved)

      const totalPriceForCart = priceForEachCartItemResolved.reduce((accumulator, currentValue) => {
        return accumulator + currentValue;
      })
      console.log(totalPriceForCart)

      setCartToal(totalPriceForCart)
      console.log("carttotal", cartTotal)
    }
    calculatingCartTotal()

    async function handleCreateOrder() {
      try {
        await createOrder();
      } catch (error) {
        console.error(error);
      }
    }

    async function handleEmptyCart() {
      for (let i = 0; i < cartWithItems.length; i++) {
        deleteCartItem(cartWithItems[i].id);
      }
      navigate('/confirmation');
    }

    return (
      <div style={{ textAlign: 'left', marginLeft: '1em' }}>
        <Typography variant="h5" style={{ marginBottom: '2%', marginTop: '2%', marginLeft: '10%' }}>{data.username}'s Shopping Cart</Typography>
        {cartWithItems.length > 0 ? (
          <>
            <div>
              {cartWithItems.map((item) => (
                <Paper elevation={3} style={{ maxWidth: '80%', margin: 'auto', alignContent: 'left', marginBottom: '1%' }}>
                  <CartItem key={item.id} item={item} />
                </Paper>
              ))}

            </div>
            <Button
              onClick={() => {
                handleCreateOrder();
                handleEmptyCart();
              }}
              variant="contained"
              sx={{
                width: '80%',
                backgroundColor: '#F94892',
                marginTop: '1em',
                marginBottom: '2em',
                marginLeft: '10%',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#F94892',
                },
              }}
            >
              Place Order
            </Button>
          </>
        ) : (
          <Paper elevation={3} style={{ maxWidth: '80%', margin: 'auto', alignContent: 'left', marginBottom: '5%' }}>
            <Typography variant="h6" style={{ padding: '1%' }}>Cart is empty. Please add items.</Typography>
          </Paper>
        )}

      </div>
    );
  } else {
    const handleEmptyCart = async (event) => {
      event.preventDefault();

      dispatch(emptyCart());
      navigate('/confirmation');
    };

    return (
      <div style={{ textAlign: 'left', marginLeft: '1em' }}>
        <Typography variant="h5" style={{ marginBottom: '2%', marginTop: '2%', marginLeft: '10%' }}>Guest Shopping Cart</Typography>
        {guestCart.length > 0 ? (
          <div>
            {guestCart.map((itemObj) => (
              <Paper elevation={3} style={{ maxWidth: '80%', margin: 'auto', alignContent: 'left', marginBottom: '1%' }}>
                <GuestCartItem key={itemObj.id} itemObj={itemObj} />
              </Paper>
            ))}
            <Button
              onClick={handleEmptyCart}
              variant="contained"
              sx={{
                width: '80%',
                backgroundColor: '#F94892',
                marginTop: '1em',
                marginBottom: '2em',
                marginLeft: '10%',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#F94892',
                },
              }}
            >
              Place Order
            </Button>
          </div>
        ) : (
          <Paper elevation={3} style={{ maxWidth: '80%', margin: 'auto', alignContent: 'left', marginBottom: '5%' }}>
            <Typography variant="h6" style={{ padding: '1%' }}>Cart is empty. Please add items or sign in to your account.</Typography>
          </Paper>
        )}
      </div>
    );
  }
};

export default Cart;
