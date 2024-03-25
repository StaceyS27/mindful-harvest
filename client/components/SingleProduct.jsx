import React from 'react';
import {
  useAddCartItemtoCartMutation,
  useGetSingleProductQuery,
  useUpdateQuantityOfCartItemMutation,
  useGetUserWithCartQuery,
} from './API/mindfulHarvestApi';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import AddCircleTwoToneIcon from '@mui/icons-material/AddCircleTwoTone';
import RemoveCircleTwoToneIcon from '@mui/icons-material/RemoveCircleTwoTone';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { setCart } from './API/cartSlice';
import { Box, Grid, Card, CardContent, Button, Typography } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';

const SingleProduct = () => {
  const [amount, setAmount] = useState(1);
  const { productId } = useParams();
  const { data: singleProductData, error: singleProductError, isLoading: singleProductIsLoading } =
    useGetSingleProductQuery(productId);
  const { data: userWithCartData, error: userWithCartError, isLoading: userWithCartIsLoading } =
    useGetUserWithCartQuery();
  const [addToCart] = useAddCartItemtoCartMutation();
  const [updateCart] = useUpdateQuantityOfCartItemMutation();
  const token = useSelector((state) => state.token);
  const adminBoolean = useSelector((state) => state.adminBoolean);
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  const cardMediaHeight = '400px';

  const setDecrease = () => {
    if (amount > 1) {
      setAmount(amount - 1);
    }
  };

  const setIncrease = () => {
    setAmount(amount + 1);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();

    try {
      if (token) {
        const existingCartItem = userWithCartData.cart.items.find(
          (item) => item.productId === Number(productId)
        );

        if (existingCartItem) {
          const newQuantity = amount + existingCartItem.quantity;
          await updateCart({
            cartItemId: existingCartItem.id,
            quantity: newQuantity,
          });
        } else {
          await addToCart({
            productId: Number(productId),
            quantity: amount,
          });
        }
      } else {
        dispatch(
          setCart({
            productId: Number(productId),
            quantity: amount,
            productPrice: singleProductData.price,
          })
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenAlert = async (event) => {
    setOpen(true);
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  if (singleProductIsLoading) {
    return <CircularProgress sx={{ color: 'black', marginTop: '40%', marginLeft: '40%' }} size={75} />;
  }

  if (singleProductError) {
    return <div>Error loading product</div>;
  }

  if (!singleProductData) {
    return <p>Unable to view product</p>;
  }

  return (
    <Box p={3}>
      <Grid container justifyContent="center">
        <Grid item>
          <Card>
            <CardContent align="center">
              <div className="single-product-details">
                <h2 className="product-title">{singleProductData.title}</h2>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  component="p"
                  className="product-description"
                >
                  {singleProductData.description}
                </Typography>
              </div>
              <div className="image-container">
                <img
                  className="single-image"
                  src={singleProductData.image}
                  alt={singleProductData.title}
                  style={{ maxWidth: '100%', height: cardMediaHeight }}
                />
              </div>
              <div className="product-price">
                <Typography variant="body1">$ {singleProductData.price}</Typography>
              </div>
            </CardContent>
            {!adminBoolean && (
              <CardContent align="center">
                <Stack direction="row" spacing={1}>
                  <IconButton
                    aria-label="remove-button"
                    style={{ color: '#F94892' }}
                    align="center"
                    onClick={setDecrease}
                  >
                    <RemoveCircleTwoToneIcon />
                  </IconButton>
                  <p>{amount}</p>
                  <IconButton
                    aria-label="add-button"
                    style={{ color: '#F94892' }}
                    align="center"
                    onClick={setIncrease}
                  >
                    <AddCircleTwoToneIcon />
                  </IconButton>
                </Stack>

                <Button
                  className="add-to-cart-button"
                  variant="contained"
                  style={{
                    backgroundColor: '#F94892',
                    '&:hover': { backgroundColor: '#F94892' },
                    fontSize: '0.9rem',
                  }}
                  onClick={(e) => {
                    handleAddToCart(e);
                    handleOpenAlert({ vertical: 'top', horizontal: 'center' });
                  }}
                >
                  Add to Cart
                </Button>
                <Snackbar open={open} onClose={handleCloseAlert}>
                  <Alert
                    onClose={handleCloseAlert}
                    severity="success"
                    sx={{ width: '100%' }}
                    style={{ backgroundColor: '#F94892' }}
                  >
                    Item is in your cart!
                  </Alert>
                </Snackbar>
              </CardContent>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

};

export default SingleProduct;