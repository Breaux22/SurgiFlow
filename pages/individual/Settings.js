import { useState, useEffect, useRef, useCallback } from 'react';
import { Image, Button, ScrollView, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FullCaseData from '../../components/FullCaseData/FullCaseData';
import ConsignmentSet from '../../components/ConsignmentSet/ConsignmentSet';
import { useRoute } from "@react-navigation/native";
import { utcToZonedTime, format } from 'date-fns-tz';
import { Buffer } from 'buffer';
import { useFocusEffect } from '@react-navigation/native';
import { useMemory } from '../../MemoryContext';

const { width, height } = Dimensions.get('window');

function SettingsPage () {
    const route = useRoute();
    const month = route.params?.month;
    const year = route.params?.year;
    const [menuStyle, setMenuStyle] = useState(styles.collapsed);
    const [openStyle, setOpenStyle] = useState(styles.icon3);
    const [closeStyle, setCloseStyle] = useState(styles.collapsed);
    const [backBlur, setBackBlur] = useState(styles.collapsed);
    const [surgeonList, setSurgeonList] = useState([]);
    const [surgChecklist, setSurgChecklist] = useState([]);
    const [newSurgeon, setNewSurgeon] = useState('');
    const [facilityList, setFacilityList] = useState([]);
    const [facilChecklist, setFacilChecklist] = useState([]);
    const [newFacility, setNewFacility] = useState('');
    const [trayList, setTrayList] = useState([]);
    const [trayChecklist, setTrayChecklist] = useState([]);
    const [newTray, setNewTray] = useState('');
    const [statList, setStatList] = useState([]);
    const [statChecklist, setStatChecklist] = useState([]);
    const [newStat, setNewStat] = useState('');
    const [delete1, setDelete1] = useState(styles.collapsed);
    const [delete2, setDelete2] = useState(styles.collapsed);
    const [delete3, setDelete3] = useState(styles.collapsed);
    const [delete4, setDelete4] = useState(styles.collapsed);
    const [surgUpdate, setSurgUpdate] = useState('');
    const [facilUpdate, setFacilUpdate] = useState('');
    const [trayUpdate, setTrayUpdate] = useState('');
    const [statUpdate, setStatUpdate] = useState('');
    const [surgeons1, setSurgeons1] = useState(styles.row);
    const [surgeons2, setSurgeons2] = useState(styles.collapsed);
    const [surgeons3, setSurgeons3] = useState(styles.collapsed);
    const [facil1, setFacil1] = useState(styles.row);
    const [facil2, setFacil2] = useState(styles.collapsed);
    const [facil3, setFacil3] = useState(styles.collapsed);
    const [trays1, setTrays1] = useState(styles.row);
    const [trays2, setTrays2] = useState(styles.collapsed);
    const [trays3, setTrays3] = useState(styles.collapsed);
    const [stats1, setStats1] = useState(styles.row);
    const [stats2, setStats2] = useState(styles.collapsed);
    const [stats3, setStats3] = useState(styles.collapsed);
    const navigation = useNavigation();
    const { myMemory, setMyMemory } = useMemory();

    async function saveData (userInfo) {
        setMyMemory((prev) => ({ ...prev, userInfo: userInfo })); // Store in-memory data
    };

    async function sessionVerify () {
        const data = {
          username: myMemory.userInfo.username,
          sessionString: myMemory.userInfo.sessionString,
          userId: myMemory.userInfo.id,
        }
        const headers = {
          'method': 'POST',
          'headers': {
              'content-type': 'application/json'
          },
          'body': JSON.stringify(data)
        }
        const response = await fetch('https://surgiflow.replit.app/verifySession', headers)
          .then(response => response.json())
          .then(data => {return data})
  
        if (response.myMessage == 'Invalid Session.') {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login", params: {} }],
            });
        }
        return;
    }
  
    async function logout () {
        const data = {
            username: myMemory.userInfo.username,
            sessionString: myMemory.userInfo.sessionString,
            userId: myMemory.userInfo.id,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data)
        }
        const url = 'https://surgiflow.replit.app/logout';
        const response = await fetch(url, headers)
        return
    }

    async function openMenu() {
        setOpenStyle(styles.collapsed);
        setCloseStyle(styles.icon3);
        setMenuStyle(styles.menu);
        setBackBlur(styles.backBlur);
    }

    async function closeMenu() {
        setCloseStyle(styles.collapsed);
        setOpenStyle(styles.icon3);
        setMenuStyle(styles.collapsed);
        setBackBlur(styles.collapsed);
    }

    async function deleteItems (list, url, setDeleteNum, follow) {
      const items = await list.filter((obj) => obj.myState === true);
      const caseData = {
        items: items,
        userId: myMemory.userInfo.id,
        sessionString: myMemory.userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://surgiflow.replit.app/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                follow();
                setDeleteNum(styles.collapsed);
            }
        })
      return response;
    };

    async function addItem (param, item, url, follow) {
      let caseData;
      if (param === 'surgeonName') {
        caseData = { 
          surgeonName: item,
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString, };
      } else if (param === 'facilityName') {
        caseData = { 
          facilityName: item, 
          userId: myMemory.userInfo.id, 
          sessionString: myMemory.userInfo.sessionString,
        };
      } else if (param === 'trayName') {
        caseData = {
          trayName: item,
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString,
        };
      } else if (param === 'status') {
        caseData = {
          status: item,
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString,
        };
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://surgiflow.replit.app/${url}`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                follow();
            }
        })
      return response;
    }

    async function deleteCheck (list, setDeleteNum) {
        if (list.some((obj) => obj.myState === true)) {
          setDeleteNum(styles.delete);
        } else {
          setDeleteNum(styles.collapsed);
        }
        return
    }
  
    async function getSurgeons() {
        const data = {
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getSurgeons';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        var tempArr = response.map((surg) => ({ id: surg.id, name: surg.surgeonName, myState: false, editStyle: styles.edit, nameStyle: styles.surgeonText, inputStyle: styles.collapsed }));
        setSurgChecklist(tempArr);
        setSurgeonList(response);
        setDelete1(styles.collapsed);
    }

    async function getFacilities() {
        const data = {
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getFacilities';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        var tempArr = response.map((facil) => ({ name: facil.facilityName, myState: false, editStyle: styles.edit, nameStyle: styles.facilityText, inputStyle: styles.collapsed }));
        setFacilChecklist(tempArr);
        setFacilityList(response);
        setDelete2(styles.collapsed);
    }

    async function getTrays() {
        const data = {
          userId: myMemory.userInfo.id,
          sessionString: myMemory.userInfo.sessionString,
        }
        const headers = {
            'method': 'POST',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(data),
        }
        const url = 'https://surgiflow.replit.app/getTrays';
        const response = await fetch(url, headers)
            .then(response => response.json())
            .then(data => {return data})
        var tempArr = response.map((tray) => ({ name: tray.trayName, myState: false, editStyle: styles.edit, nameStyle: styles.trayText, inputStyle: styles.collapsed }));
        setTrayChecklist(tempArr);
        setTrayList(response);
        setDelete3(styles.collapsed);
    }

    async function updateCheck(setList, index, deleteNum) {
      setList((prevArr) => {
        const updatedArr = [...prevArr];
        if (updatedArr[index].myState === false) {
          updatedArr[index].myState = true;
          deleteCheck(updatedArr, deleteNum)
          return updatedArr;
        } else {
          updatedArr[index].myState = false;
          deleteCheck(updatedArr, deleteNum);
          return updatedArr;
        }
      })
    }

    async function updateVisible(setList, index, isVisible) {
      if (isVisible == 0) {
        setList((prevArr) => {
          const updatedArr = [...prevArr];
          updatedArr[index].nameStyle = styles.collapsed;
          updatedArr[index].inputStyle = styles.addBox;
          updatedArr[index].editStyle = styles.collapsed;
          return updatedArr;
        })
      } else {
        setList((prevArr) => {
          const updatedArr = [...prevArr];
          updatedArr[index].nameStyle = styles.surgeonText;
          updatedArr[index].inputStyle = styles.collapsed;
          updatedArr[index].editStyle = styles.edit;
          return updatedArr;
        })
      }
    }

    async function updateSurgeon (prevName, index) {
      const caseData = {
        prevName: prevName,
        newName: surgUpdate,
        userId: myMemory.userInfo.id,
        sessionString: myMemory.userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://surgiflow.replit.app/updateSurgeon`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setSurgChecklist, index, 1);
                getSurgeons();
            }
        })
      return response;
    }

    async function updateFacility (prevName, index) {
      const caseData = {
        prevName: prevName,
        newName: facilUpdate,
        userId: myMemory.userInfo.id,
        sessionString: myMemory.userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://surgiflow.replit.app/updateFacility`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setFacilChecklist, index, 1);
                getFacilities();
            }
        })
      return response;
    }

    async function updateTray (tray, index) {
      const caseData = {
        trayId: tray.id,
        newName: trayUpdate,
        userId: myMemory.userInfo.id,
        sessionString: myMemory.userInfo.sessionString,
      }
      const headers = {
        'method': 'POST',
        'headers': {
            'content-type': 'application/json'
        },
        'body': JSON.stringify(caseData)
      }
      const response = await fetch(`https://surgiflow.replit.app/updateTrayName`, headers)
        .then(async response => {
            if (!response.ok) {
                console.error('Data Not Saved')
            } else if (response.ok) {
                updateVisible(setTrayChecklist, index, 1);
                getTrays();
            }
        })
      return response;
    }

    async function hideEdits(setList, isVisible) {
      if (isVisible == 1) {
        // hide
        setList((prevArr) => {
          var tempArr = [...prevArr];
          tempArr.map((item) => {
            item.editStyle = styles.collapsed;
            item.myState = false;
          })
          return tempArr;
        })
      } else {
        // show
        setList((prevArr) => {
          var tempArr = [...prevArr];
          tempArr.map((item) => {
            item.editStyle = styles.edit;
          })
          return tempArr;
        })
      }
    }

    useEffect(() => {
        (async () => {
          getSurgeons();
          getFacilities();
          getTrays();
        })();    
      
        return () => {};
    }, [])
  
    return (
      <SafeAreaView>
        <TouchableOpacity
          style={{position: "absolute", marginLeft: width * 0.89, marginTop: width * 0.125, zIndex: 1, }}
          onPress={() => {
              navigation.reset({
                  index: 0,
                  routes: [{name: 'Create New Case', params: {backTo: {name: 'Settings', params: {month: month, year: year}}}}]
              })
          }}
          >
          <Image source={require('../../assets/icons/plus-symbol-button.png')} style={{width: width * 0.09, height: width * 0.09, }}/>
        </TouchableOpacity>
        <View style={styles.menuButtons}>
          <TouchableOpacity 
              style={{width: width * 0.2, }}
              onPress={openMenu}
              >
              <Image source={require('../../assets/icons/menu.png')} style={openStyle}/>
          </TouchableOpacity>
          <TouchableOpacity
              style={{width: width * 0.2, }}
              onPress={closeMenu}
              >
              <Image source={require('../../assets/icons/close.png')} style={closeStyle}/>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={menuStyle}>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Monthly View", params: {month: month, year: year} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>Monthly View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Weekly View", params: {month: month, year: year} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>Weekly View</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "List Cases", params: {month: month, year: year} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>Case List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "List Trays", params: {month: month, year: year} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>Tray List</Text>
              </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                closeMenu();
              }}
              >
                <Text allowFontScaling={false} style={styles.optionText}>Settings</Text>
            </TouchableOpacity>
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  logout();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Login", params: {} }],
                  });
                }}
                >
                  <Text allowFontScaling={false} style={styles.optionText}>Logout</Text>
              </TouchableOpacity>
          </View>
          <View style={backBlur}></View>
        </View>
        <ScrollView>
          <View style={surgeons1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Surgeons:</Text>
            <TouchableOpacity
              onPress={() => {
                setSurgeons1(styles.collapsed);
                setSurgeons2(styles.row);
                setSurgeons3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={surgeons2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Surgeons:</Text>
              <TouchableOpacity
                onPress={() => {
                  setSurgeons1(styles.row);
                  setSurgeons2(styles.collapsed);
                  setSurgeons3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete1}
                onPress={() => deleteItems(surgChecklist, 'deleteSurgeons', setDelete1, getSurgeons)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={surgeons3}>
            <View style={styles.addBox}>
              <TextInput 
                allowFontScaling={false}
                value={newSurgeon}
                onChangeText={(input) => {setNewSurgeon(input)}}
                style={styles.addText}
                placeholder={"Add New Surgeon..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('surgeonName', newSurgeon, 'addSurgeon', getSurgeons);
                  setNewSurgeon('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {surgeonList.map((surgeon, index) => {
              return (
                <View key={surgeon.surgeonName + index} style={styles.row}>
                  <View style={surgChecklist[index].nameStyle}>
                    <Checkbox
                      value={surgChecklist[index].myState}
                      onValueChange={() => updateCheck(setSurgChecklist, index, setDelete1)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{surgeon.surgeonName}</Text>
                  </View>
                  <View style={surgChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={surgUpdate}
                      onChangeText={(input) => {setSurgUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Surgeon Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setSurgChecklist, 0);
                        updateSurgeon(surgeon.surgeonName, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setSurgChecklist, 1);
                        updateVisible(setSurgChecklist, index, 0);
                        setSurgUpdate(surgeon.surgeonName);
                      }}
                    >
                    <Text allowFontScaling={false} style={surgChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={facil1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Facilities:</Text>
            <TouchableOpacity
              onPress={() => {
                setFacil1(styles.collapsed);
                setFacil2(styles.row);
                setFacil3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={facil2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Facilities:</Text>
              <TouchableOpacity
                onPress={() => {
                  setFacil1(styles.row);
                  setFacil2(styles.collapsed);
                  setFacil3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete2}
                onPress={() => deleteItems(facilChecklist, 'deleteFacilities', setDelete2, getFacilities)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={facil3}>
            <View style={styles.addBox}>
              <TextInput 
                 allowFontScaling={false}
                value={newFacility}
                onChangeText={(input) => {setNewFacility(input)}}
                style={styles.addText}
                placeholder={"Add New Facility..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('facilityName', newFacility, 'addFacility', getFacilities)
                  setNewFacility('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {facilityList.map((facility, index) => {
              return (
                <View key={facility.facilityName + index} style={styles.row}>
                  <View style={facilChecklist[index].nameStyle}>
                    <Checkbox
                      value={facilChecklist[index].myState}
                      onValueChange={() => updateCheck(setFacilChecklist, index, setDelete2)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{facility.facilityName}</Text>
                  </View>
                  <View style={facilChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={facilUpdate}
                      onChangeText={(input) => {setFacilUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Facility Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setFacilChecklist, 0);
                        updateFacility(facility.facilityName, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setFacilChecklist, 1);
                        updateVisible(setFacilChecklist, index, 0);
                        setFacilUpdate(facility.facilityName);
                      }}
                    >
                    <Text allowFontScaling={false} style={facilChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={trays1}>
            <Text allowFontScaling={false} style={styles.title}>Edit Trays:</Text>
            <TouchableOpacity
              onPress={() => {
                setTrays1(styles.collapsed);
                setTrays2(styles.row);
                setTrays3(styles.editBox)
              }}
              >
              <Image source={require('../../assets/icons/plus.png')} style={styles.icon}/>
            </TouchableOpacity>
          </View>
          <View style={trays2}>
              <Text allowFontScaling={false} style={styles.title}>Edit Trays:</Text>
              <TouchableOpacity
                onPress={() => {
                  setTrays1(styles.row);
                  setTrays2(styles.collapsed);
                  setTrays3(styles.collapsed);
                }}
                >
                <Image source={require('../../assets/icons/minus.png')} style={styles.icon}/>
              </TouchableOpacity>
              <TouchableOpacity 
                style={delete3}
                onPress={() => deleteItems(trayChecklist, 'deleteTrays', setDelete3, getTrays)}
                >
                <Text allowFontScaling={false} style={styles.deleteText}>Delete Selected</Text>
              </TouchableOpacity>
          </View>
          <ScrollView style={trays3}>
            <View style={styles.addBox}>
              <TextInput 
                 allowFontScaling={false}
                value={newTray}
                onChangeText={(input) => {setNewTray(input)}}
                style={styles.addText}
                placeholder={"Add New Tray..."}
                />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => {
                  addItem('trayName', newTray, 'addTray', getTrays);
                  setNewTray('');
                }}
                >
                <Text allowFontScaling={false} style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {trayList.map((tray, index) => {
              return (
                <View key={tray.trayName + index} style={styles.row}>
                  <View style={trayChecklist[index].nameStyle}>
                    <Checkbox
                      value={trayChecklist[index].myState}
                      onValueChange={() => updateCheck(setTrayChecklist, index, setDelete3)}
                      style={styles.checkbox}
                    />
                    <Text allowFontScaling={false} style={styles.name}>{tray.trayName}</Text>
                  </View>
                  <View style={trayChecklist[index].inputStyle}>
                    <TextInput 
                      allowFontScaling={false}
                      value={trayUpdate}
                      onChangeText={(input) => {setTrayUpdate(input)}}
                      style={styles.addText}
                      placeholder={"Edit Tray Name..."}
                      />
                    <TouchableOpacity 
                      style={styles.addButton}
                      onPress={() => {
                        hideEdits(setTrayChecklist, 0);
                        updateTray(tray, index)
                      }}
                      >
                      <Text allowFontScaling={false} style={styles.addButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                      onPress={() => {
                        hideEdits(setTrayChecklist, 1);
                        updateVisible(setTrayChecklist, index, 0);
                        setTrayUpdate(tray.trayName);
                      }}
                    >
                    <Text allowFontScaling={false} style={trayChecklist[index].editStyle}>- Edit</Text>
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
          <View style={{height: height * 1.1}}></View>
        </ScrollView>
      </SafeAreaView>
    )
};

const styles = StyleSheet.create({
  container: {
    height: height * 1.5,
  },
  icon: {
    width: width * 0.06,
    height: width * 0.06,
    marginTop: width * 0.035,
    marginLeft: width * 0.01
  },
  row: {
      flexDirection: 'row'
  },
  title: {
      fontSize: width * 0.06,
      width: width * 0.375,
      marginLeft: width * 0.025,
      marginTop: width * 0.025
  },
  edit: {
    color: "rgba(0, 122, 255, 0.8)"
  },
  editBox: {
      borderWidth: width * 0.001,
      width: width * 0.95,
      minHeight: width * 0.4,    
      maxHeight: width,
      marginLeft: width * 0.025,
      padding: width * 0.02,
      borderRadius: 5,
  },
  checkbox: {
    marginLeft: width * 0.02,
    marginBottom: width * 0.02,
  },
  name: {
    marginLeft: width * 0.02,
    marginBottom: width * 0.02,
  },
  delete: {
    marginLeft: width * 0.24,
    marginTop: width * 0.045
  },
  deleteText: {
    color: "#c2042d"
  },
  surgeonText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  facilityText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  trayText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  statusText: {
    flexDirection: "row", 
    width: width * 0.8
  },
  addBox: {
    borderWidth: width * 0.002,
    borderRadius: 5,
    width: width * 0.75,
    marginBottom: width * 0.04,
    flexDirection: "row",
  },
  addText: {
    width: width * 0.73,
    marginLeft: width * 0.02,
    height: width * 0.065
  },
  addButton: {
    backgroundColor: "rgba(211, 211, 211, 0.5)",
    width: width * 0.15,
    marginLeft: width * 0.01,
    borderRadius: 5,
  },
  addButtonText: {
    fontSize: width * 0.05,
    marginLeft: width * 0.03
  },
  menuButtons: {
      borderBottomWidth: width * 0.002,
      borderBottomColor: "#cfcfcf",
      height: width * 0.124
  },
  collapsed: {
      display: 'none',
  },
  icon3: {
      width: width * 0.1,
      height: width * 0.1,
      marginLeft: width * 0.02,
  },
  menu: {
      position: "absolute", 
      backgroundColor: "#fff", 
      height: height, 
      width: width * 0.7, 
      zIndex: 1, 
      opacity: 0.98
  },
  backBlur: {
      backgroundColor: "rgba(211, 211, 211, 0.5)", 
      zIndex: 1, 
      height: height, 
      width: width * 0.3, 
      position: "absolute", 
      marginLeft: width * 0.7
  },
  option: {
      //backgroundColor: "rgba(0, 122, 255, 0.8)",
      width: width * 0.4,
      height: width * 0.09,
      marginLeft: width * 0.02,
      marginTop: width * 0.04,
      marginBottom: width * 0.02,
      borderBottomWidth: 1,
      borderRadius: 5
  },
  optionText: {
      //color: "#fff",
      fontSize: width * 0.06,
      marginTop: width * 0.0075,
      textAlign: "center"
  },
});

export default SettingsPage;