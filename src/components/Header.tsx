import { useAppContext } from "../context/AppContext";
import { Link } from "react-router-dom";

const Header = () => {
    const { coins } = useAppContext();

    return (
        <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
            <h1 className="text-lg font-bold">Pharma Contacts</h1>
            <div className="flex gap-4 items-center">
                <Link to="/listing" className="hover:underline">Home</Link>
                <Link to="/my-list" className="hover:underline">My List</Link>
                <span className="bg-yellow-400 text-black px-2 py-1 rounded">Coins: {coins}</span>
            </div>
        </header>
    );
};

export default Header;
