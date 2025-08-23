import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import { API_ITEMS_URL } from '../../constants/environment';
import ForgeItemActions from './ForgeItemActions';
import ForgeItemAttributes from './ForgeItemAttributes';
import ForgeItemCategories from './ForgeItemCategories';
import ForgeItemList from './ForgeItemList';

const ForgeItem = () => {
  const debugMode = true;

  const location = useLocation();
  const { t } = useTranslation();

  const game = location.state?.game;
  const character = location.state?.character;

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    itemTypeId: '',
    category: '',
    weapon: {
      type: '',
      attackTable: '',
      skillId: '',
      fumble: '',
      sizeAdjustment: 0,
    },
    info: {
      cost: {
        value: '',
        type: '',
      },
      bonus: 0,
      lenght: '',
      weight: '',
      strength: '',
      productionTime: '',
    },
  });

  const mapItem = (item) => {
    return {
      ...item,
      itemTypeId: item.id,
      name: t(item.id),
    };
  };

  const fetchItems = async (category) => {
    try {
      console.log(`TacticalCharacterAddItem.fetchItems ${category}`);
      const response = await fetch(`${API_ITEMS_URL}/items?category=${category}&size=500`);
      const responseBody = await response.json();
      const items = responseBody.content.map(mapItem);
      if (category === 'armor') {
        items.sort((a, b) => a.armor.armorType - b.armor.armorType);
      } else {
        items.sort((a, b) => a.name.localeCompare(b.name));
      }
      setItems(items);
    } catch (error) {
      console.error(`TacticalCharacterAddItem.fetchItems error ${error}`);
    }
  };

  const loadItemForm = (item) => {
    setFormData(item);
  };

  useEffect(() => {
    fetchItems('weapon');
  }, []);

  if (!game || !character) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <ForgeItemActions game={game} character={character} formData={formData} />
      <div className="generic-main-content">
        <Grid container spacing={2}>
          <Grid item size={6}>
            <ForgeItemCategories onChange={fetchItems} />
            <ForgeItemList items={items} onSelectedItem={loadItemForm} />
          </Grid>
          <Grid item size={6}>
            <ForgeItemAttributes formData={formData} setFormData={setFormData} />
          </Grid>
        </Grid>
        {debugMode ? (
          <div>
            <h3>formData</h3>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ForgeItem;
