import React, {useContext, useEffect} from 'react';
import {ScrollView} from "react-native";
import GroupList from "./GroupList";

import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import * as firebase from 'firebase';

export const GroupScreen = ({ navigation }) => {
    const db = firebase.database();
    const { user } = useContext(AuthenticatedUserContext);
    const username = user.email.substring(0,user.email.length-10);
    const ref = db.ref(`users/${username}/groups`);

    let fetchGroup = async () => {
        return ref.once("value")
            .then( (snapshot) => {
                return snapshot.val();
            });
    }

    useEffect( () => {
        ref.on('value', snapshot => {
            fetchGroup().then();
        });
        // return () => ref.off('value', onValueChange);
    }, []);

    return (
        <ScrollView>
            <GroupList navigate={navigation.navigate} fetchGroup={fetchGroup}/>
        </ScrollView>
    )
}
