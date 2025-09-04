/* eslint-disable react/prop-types */
import React from 'react';
import { useTranslation } from 'react-i18next';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import AddButton from '../button/AddButton';

const ItemList = ({ items, onAddItem }) => {
  const { t } = useTranslation();

  const handleAddClick = (e) => {
    onAddItem(e);
  };

  return (
    <ImageList sx={{ width: 800 }} cols={5} rowHeight={150}>
      {items.map((item, index) => (
        <ImageListItem key={index}>
          <img
            src={`/static/images/items/${item.id}.png?w=150&h=150&fit=crop`}
            srcSet={`/static/images/items/${item.id}.png?w=150&h=150&fit=crop&dpr=2 2x`}
            alt={item.id}
            loading="lazy"
            style={{ borderRadius: '8px' }}
          />
          <ImageListItemBar title={t(item.id)} actionIcon={<AddButton size={30} option={item.id} onClick={() => handleAddClick(item.id)} />} />
        </ImageListItem>
      ))}
    </ImageList>
  );
};

export default ItemList;
