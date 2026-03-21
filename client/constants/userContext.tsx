import { useContext,createContext,useState, SetStateAction,Dispatch } from "react";

type User={
    name:string,
    followers:number,
    following:number,
    mycourses:any[],
    mystore:any[],
    coins:number,
    boughtcourses:any[],
    boughtitems:any[]
};

type UserContextType={
    user:User | null,
setUser: Dispatch<SetStateAction<User | null>>;}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({children}:any) => {
    const [user,setUser] = useState<User | null>(null);
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}