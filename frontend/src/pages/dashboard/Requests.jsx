import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";

function Requests() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await axios.get("http://localhost:5000/api/transactions/pending");
    setRequests(res.data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    await axios.post("http://localhost:5000/api/transactions/approve", {
      transaction_id: id,
    });

    fetchRequests();
  };

  const handleReject = async (id) => {
    await axios.post("http://localhost:5000/api/transactions/reject", {
      transaction_id: id,
    });

    fetchRequests();
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>Borrow Requests</h2>

        {requests.map((r) => (
          <div key={r.transaction_id} style={{ marginBottom: "10px" }}>
            <p>User: {r.user_id} | Book: {r.book_id}</p>

            <button onClick={() => handleApprove(r.transaction_id)}>
              Approve
            </button>

            <button onClick={() => handleReject(r.transaction_id)}>
              Reject
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default Requests;