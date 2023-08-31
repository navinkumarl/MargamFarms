import React, { useEffect, useState } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { useProfileMutation, useUploadUserImageMutation } from '../slices/usersApiSlice';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { setCredentials } from '../slices/authSlice';
import defaultImage from '../components/default.jpg';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const { userInfo } = useSelector((state) => state.auth);
  const [image, setImage] = useState(userInfo.image || '../components/default.jpg');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  

  const cart = useSelector((state) => state.cart);



  const { data: orders, isLoading, error } = useGetMyOrdersQuery();

  const [updateProfile, { isLoading: loadingUpdateProfile }] =
    useProfileMutation();
    const [selectedImageFile, setSelectedImageFile] = useState(null);


    const [uploadUserImage, { isLoading: loadingUpload }] =
    useUploadUserImageMutation();

    useEffect(() => {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setMobile(userInfo.mobile);
      setImage(userInfo.image);
    }, [userInfo]);

  const dispatch = useDispatch();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          mobile,
          image,
          password,
        }).unwrap();
        dispatch(setCredentials({ ...res }));
        toast.success('Profile updated successfully');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    setSelectedImageFile(file);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await uploadUserImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || err.error);
    }
  };

  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        <Form onSubmit={submitHandler}>
        {selectedImageFile ? (
    <div className='selected-image-container'>
      <img
        src={URL.createObjectURL(selectedImageFile)}
        alt='Selected'
        className='selected-image'
      />
    </div>
  ) : (
    <div className='selected-image-container'>
      <img
        src={userInfo.image || defaultImage }
        alt='Default'
        className='selected-image'
      />
    </div>
  )}
        <Form.Group controlId='image'>
  <Form.Control
    type='text'
    placeholder='Enter image url'
    value={image}
    onChange={(e) => setImage(e.target.value)}
  />
  <Form.Control
    label='Choose File'
    onChange={uploadFileHandler}
    type='file'
  />

  {loadingUpload && <Loader />}
</Form.Group>




          <Form.Group className='my-2' controlId='name'>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type='name'
              placeholder='Enter name'
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='email'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className='my-2' controlId='mobile'>
          <Form.Label>Mobile Number</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter mobile number'
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          ></Form.Control>
        </Form.Group>

          <Form.Group className='my-2' controlId='password'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className='my-2' controlId='confirmPassword'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>


          <Button type='submit' variant='primary'>
            Update
          </Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table striped bordered hover responsive className='table-sm'>
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.createdAt.substring(0, 10)}</td>
                  <td>{order.totalPrice}</td>
                  <td>
                    {order.isPaid ? (
                      order.paidAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      order.deliveredAt.substring(0, 10)
                    ) : (
                      <FaTimes style={{ color: 'red' }} />
                    )}
                  </td>
                  <td>
                  <Link
  to={
    cart.paymentMethod === 'COD'
      ? `/order/cod/${order._id}?fromProfile=true`
      : `/order/online/${order._id}`
  }
>
  <Button className='btn-sm' variant='light'>
    Details
  </Button>
</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;