import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface State {
  foods: FoodProps[];
  editingFood: FoodProps;
  modalOpen: boolean;
  editModalOpen: boolean;
}

interface FoodProps {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image_url: string;
}

function Dashboard() {
    const [state, setState] = useState<State>({
      foods: [],
      modalOpen: false,
      editModalOpen: false,
      editingFood: {
        id: 0,
        name: '',
        description: '',
        price: 0,
        available: false,
        image_url: '',
      },
    });

  useEffect(() => {
    (async function loadFoods() {
      const response = await api.get('/foods');
      setState(prevState => ({
        ...prevState,
        foods: [...response.data],
        modalOpen: false,
      }));
    })();
  }, []);
  
  const handleAddFood = async (food: FoodProps) => {
    const { foods } = state;

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setState(
        { 
          ...state,
          foods: [...foods, response.data],
          modalOpen: !modalOpen 
        });
    } catch (err) {
      console.log(err);
    }
  }

  const handleUpdateFood = async (food: FoodProps) => {
    const { foods, editingFood } = state;

    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );
      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );
      setState(
        { 
          ...state,
          foods: foodsUpdated,
          modalOpen: !modalOpen,
          editModalOpen: !editModalOpen,
        });
    } catch (err) {
      console.log(err);
    }
  }

  const handleDeleteFood = async (id: Number) => {
    const { foods } = state;

    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setState(
      { 
        ...state,
        foods: foodsFiltered,
        modalOpen: !modalOpen 
      });
  }

  const toggleModal = () => {
    const { modalOpen } = state;
    setState(
      {
        ...state,
        modalOpen: !modalOpen
      });
      
  }

  const toggleEditModal = () => {
    const { editModalOpen } = state;
    setState(
      { 
        ...state,
        editModalOpen: !editModalOpen, 
        modalOpen: !modalOpen 
      });
  }
  
  const handleEditFood = (food: FoodProps) => {
    setState({
      ...state,
      foods: state.foods,
      editingFood: food,
      editModalOpen: true,
      modalOpen: !modalOpen
    })
  }

  const { modalOpen, editModalOpen, editingFood, foods } = state;

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      {console.log(state)}
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />
      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
