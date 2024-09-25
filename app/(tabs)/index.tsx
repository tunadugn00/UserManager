//app\(tabs)\index.tsx
import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, Button, Alert, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FirebaseError, initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjrL8ocVNv3z5_GA5QXJmFzE9HjuKI9n8",
  authDomain: "user-management-e7499.firebaseapp.com",
  projectId: "user-management-e7499",
  storageBucket: "user-management-e7499.appspot.com",
  messagingSenderId: "964354909574",
  appId: "1:964354909574:web:751f894e9c21de0521b807"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

export default function TabOneScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleError = (error: unknown, operation: string) => {
    console.error(`Error during ${operation}:`, error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof FirebaseError) {
      errorMessage = `Firebase error (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    Alert.alert('Error', `Failed to ${operation}: ${errorMessage}`);
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data()
      } as User));
      setUsers(userList);
    } catch (error) {
      handleError(error, 'fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async () => {
    if (!name || !email || !age) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'users'), {
        name,
        email,
        age: parseInt(age)
      });
      Alert.alert('Success', 'User added successfully');
      setName('');
      setEmail('');
      setAge('');
      fetchUsers();
    } catch (error) {
      handleError(error, 'add user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const userRef = doc(db, 'users', editingUser.id);
      await updateDoc(userRef, {
        name: editingUser.name,
        email: editingUser.email,
        age: editingUser.age
      });
      Alert.alert('Success', 'User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      handleError(error, 'update user');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      Alert.alert('Success', 'User deleted successfully');
      fetchUsers();
    } catch (error) {
      handleError(error, 'delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      {editingUser && editingUser.id === item.id ? (
        <>
          <TextInput
            style={styles.editInput}
            value={editingUser.name}
            onChangeText={(text) => setEditingUser({...editingUser, name: text})}
          />
          <TextInput
            style={styles.editInput}
            value={editingUser.email}
            onChangeText={(text) => setEditingUser({...editingUser, email: text})}
          />
          <TextInput
            style={styles.editInput}
            value={editingUser.age.toString()}
            onChangeText={(text) => setEditingUser({...editingUser, age: parseInt(text)})}
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={updateUser}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setEditingUser(null)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userDetails}>{item.email} - {item.age} years old</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setEditingUser(item)}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteUser(item.id)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Age"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addUser}>
          <Text style={styles.buttonText}>Add User</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      
      <Text style={styles.subtitle}>User List</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
  },
  input: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '100%',
  },
  list: {
    flex: 1,
  },
  userItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  userInfo: {
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    fontSize: 14,
    color: 'gray',
  },
  editInput: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});