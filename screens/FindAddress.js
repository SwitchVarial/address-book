import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import { StyleSheet, FlatList, View, Keyboard } from "react-native";
import { Button, Header, Input, ListItem } from "react-native-elements";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initializeApp } from "firebase/app";
import {
  GOOGLE_API_KEY,
  GOOGLE_GEOCODING_API_URL,
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_DATABASE_URL,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGIN_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";
import { getDatabase, push, ref, onValue, remove } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGIN_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export default function FindAddress({ navigation }) {
  const [search, setSearch] = useState();
  const [list, setList] = useState([]);

  let url =
    GOOGLE_GEOCODING_API_URL + "?address=" + search + "&key=" + GOOGLE_API_KEY;

  useEffect(() => {
    const itemsRef = ref(database, "/address-book");
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      const addressBook = data
        ? Object.keys(data).map((key) => ({ key, ...data[key] }))
        : [];
      setList(addressBook);
    });
  }, []);

  const searchLocation = async () => {
    Keyboard.dismiss();
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status !== "ZERO_RESULTS") {
        const { lat, lng } = data.results[0].geometry.location;
        const address = data.results[0].formatted_address;
        push(ref(database, "/address-book"), {
          address: address,
          latitude: lat,
          longitude: lng,
        });
        setSearch();
      } else if (search == undefined) {
        Alert.alert("Fill in search terms");
      } else {
        Alert.alert("No results found!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = (id) => {
    remove(ref(database, "address-book/" + id));
  };

  const renderItem = ({ item }) => (
    <ListItem bottomDivider onLongPress={() => deleteItem(item.key)}>
      <ListItem.Content>
        <View style={styles.row}>
          <ListItem.Title style={styles.listTitle}>
            {item.address}
          </ListItem.Title>
          <ListItem.Subtitle>
            <View style={{ height: "100%" }}>
              <Button
                title="Show on Map"
                buttonStyle={{ paddingVertical: 20 }}
                type="clear"
                onPress={() =>
                  navigation.navigate("Map", {
                    latitude: item.latitude,
                    longitude: item.longitude,
                    address: item.address,
                  })
                }
              />
            </View>
          </ListItem.Subtitle>
        </View>
      </ListItem.Content>
      <ListItem.Chevron
        size={20}
        onPress={() =>
          navigation.navigate("Map", {
            latitude: item.latitude,
            longitude: item.longitude,
            address: item.address,
          })
        }
      />
    </ListItem>
  );

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Header centerComponent={{ text: "My Places", style: styles.title }} />
        <View style={styles.control}>
          <Input
            placeholder="Type in address"
            label="Place Finder"
            inputStyle={{ paddingVertical: 15 }}
            labelStyle={{ color: "black" }}
            onChangeText={(search) => setSearch(search)}
            value={search}
          />
          <Button
            icon={{ color: "white", name: "save" }}
            iconRight
            iconContainerStyle={{ marginLeft: 10 }}
            onPress={searchLocation}
            title="Save"
            titleStyle={{ fontWeight: "bold" }}
            buttonStyle={{ padding: 15 }}
            containerStyle={{
              width: "95%",
            }}
          />
        </View>
        <FlatList style={styles.list} data={list} renderItem={renderItem} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  control: {
    alignItems: "center",
    justifyContent: "flex-start",
    width: "95%",
    marginTop: 15,
    marginBottom: 5,
  },
  row: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    fontWeight: "bold",
    color: "white",
  },
  list: {
    width: "96%",
    marginTop: 20,
  },
  listTitle: {
    fontWeight: "bold",
    width: "50%",
  },
});
