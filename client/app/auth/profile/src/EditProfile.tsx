import React, { useState } from "react";
import { Text, StyleSheet, View, TouchableOpacity, Modal, TextInput, Platform } from "react-native";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store/store";
import api from "@/apis/api";
import { userLogin } from "@/store/slices/userSlice";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { SafeAreaView } from "react-native";

// Props type definition for the EditProfile component
type EditProps = {
    editProfileVisible: boolean;
    setEditProfileVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

// Interface for form values
interface FormValues {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: Date;
}

// Define the validation schema using yup
const schema = yup.object().shape({
    email: yup
        .string()
        .email("Must be a valid email")
        .required("Email is required"),
    firstName: yup.string().required("First name is required"),
    lastName: yup.string().required("Last name is required"),
    phoneNumber: yup
        .string()
        .matches(/^\+?[1-9]\d{1,14}$/, "Must be a valid phone number")
        .test(
            "len",
            "Phone number must be 10 characters",
            (val: any) => val.length === 10
        )
        .required("Phone number is required"),
    dateOfBirth: yup
        .date()
        .max(new Date(), "Date of birth must be in the past")
        .required("Date of birth is required"),
});

const EditProfile = ({
    editProfileVisible,
    setEditProfileVisible,
}: EditProps) => {
    const user = useAppSelector((state: RootState) => state.user);
    const dispatch = useAppDispatch();

    // Local state
    const [date, setDate] = useState(new Date());
    const [show, setShow] = useState(false);

    // react-hook-form setup with yup validation resolver
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            email: user.profile.email,
            phoneNumber: user.profile.phoneNumber,
            dateOfBirth: user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth) : new Date(),
        },
    });

    // Function to reset form values to default
    const handleReset = () => {
        reset({
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            email: user.profile.email,
            phoneNumber: user.profile.phoneNumber,
            dateOfBirth: user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth) : new Date(),
        });
    };

    // Function to handle form submission
    const onSubmit = (data: FormValues) => {
        api.put("/api/profile/profile-put", data)
            .then((res) => {
                let updatedData = {
                    profile: res.data,
                    accessToken: user.accessToken,
                };
                dispatch(userLogin(updatedData));
                setEditProfileVisible(false);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    // Function to handle date change in DateTimePicker
    const onChangeDatePicker = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || date;
        setShow(Platform.OS === "ios");
        setDate(currentDate);
        setValue("dateOfBirth", currentDate, { shouldValidate: true }); // Update form state
    };

    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={editProfileVisible}
            onRequestClose={() => {
                setEditProfileVisible(!editProfileVisible);
            }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => {
                            setEditProfileVisible(false);
                            handleReset();
                        }}
                    >
                        <Text style={styles.title}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit User</Text>
                    <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.title}>Save</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <View>
                        {/* First Name Input */}
                        <View style={styles.rowWraper}>
                            <View style={styles.row}>
                                <Text style={styles.rowLabel}>First Name</Text>
                                <View style={styles.rowSpacer} />
                                <Controller
                                    control={control}
                                    name="firstName"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <TextInput
                                            style={styles.rowValue}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="First Name"
                                        />
                                    )}
                                />
                            </View>
                            {errors.firstName && (
                                <Text style={styles.errorText}>
                                    {errors.firstName.message}
                                </Text>
                            )}
                        </View>
                        <View style={styles.rowWraper}>
                            <View style={styles.row}>
                                {/* Last Name Input */}
                                <Text style={styles.rowLabel}>Last Name</Text>
                                <View style={styles.rowSpacer} />
                                <Controller
                                    control={control}
                                    name="lastName"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <TextInput
                                            style={styles.rowValue}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Last Name"
                                        />
                                    )}
                                />
                            </View>
                            {errors.lastName && (
                                <Text style={styles.errorText}>
                                    {errors.lastName.message}
                                </Text>
                            )}
                        </View>
                        <View style={styles.rowWraper}>
                            <View style={styles.row}>
                                {/* Email Input */}
                                <Text style={styles.rowLabel}>Email</Text>
                                <View style={styles.rowSpacer} />
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <TextInput
                                            style={styles.rowValue}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Email"
                                        />
                                    )}
                                />
                            </View>
                            {errors.email && (
                                <Text style={styles.errorText}>
                                    {errors.email.message}
                                </Text>
                            )}
                        </View>
                        <View style={styles.rowWraper}>
                            <View style={styles.row}>
                                {/* Phone Number Input */}
                                <Text style={styles.rowLabel}>Phone</Text>
                                <View style={styles.rowSpacer} />
                                <Controller
                                    control={control}
                                    name="phoneNumber"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <TextInput
                                            style={styles.rowValue}
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            placeholder="Phone Number"
                                        />
                                    )}
                                />
                            </View>
                            {errors.phoneNumber && (
                                <Text style={styles.errorText}>
                                    {errors.phoneNumber.message}
                                </Text>
                            )}
                        </View>
                        <View style={styles.rowWraper}>
                            <View style={styles.row}>
                                {/* Date of Birth Input */}
                                <Text style={styles.rowLabel}>
                                    Date Of Birth
                                </Text>
                                <View style={styles.rowSpacer} />
                                <Controller
                                    control={control}
                                    name="dateOfBirth"
                                    render={({
                                        field: { onChange, onBlur, value },
                                    }) => (
                                        <View>
                                            <TouchableOpacity
                                                onPress={() => setShow(true)}
                                            >
                                                <Text style={styles.rowValue}>
                                                    {value
                                                        ? moment(value).format(
                                                            "YYYY-MM-DD"
                                                        )
                                                        : "Select Date"}
                                                </Text>
                                                {show && (
                                                    <DateTimePicker
                                                        testID="dateTimePicker"
                                                        value={date}
                                                        mode="date"
                                                        display="default"
                                                        onChange={
                                                            onChangeDatePicker
                                                        }
                                                        maximumDate={new Date()}
                                                    />
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                            </View>
                            {errors.dateOfBirth && (
                                <Text style={styles.errorText}>
                                    {errors.dateOfBirth.message}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        </Modal >
    );
};

export default EditProfile;

// Style
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f6f6f6",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#333',
        marginBottom: 6,
        marginTop: 6,
    },
    section: {
        // paddingTop: 12,
    },
    rowWraper: {
        paddingLeft: 24,
        borderTopWidth: 1,
        borderTopColor: "#e3e3e3",
        backgroundColor: "#fff",
    },
    row: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingRight: 24,
    },
    rowLabel: {
        fontSize: 17,
        fontWeight: "500",
        color: "#000",
    },
    rowSpacer: {
        flex: 1,
    },
    rowValue: {
        fontSize: 17,
        color: "#616161",
        marginRight: 4,
        textAlign: "right",
    },
    errorText: {
        color: "red",
        marginBottom: 10,
    },
});