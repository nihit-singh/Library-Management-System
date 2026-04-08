import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import transactionService from "../../services/transactionService";
import "./requests.css";

function Requests() {
  const [data, setData] = useState([]);

  const fetchRequests = async () => {
    const res = await transactionService.getRequests();
    setData(res);
  };

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  fetchRequests();

  const interval = setInterval(() => {
    fetchRequests();
  }, 5000); // every 5 sec

  return () => clearInterval(interval);
}, []);

  const handleApprove = async (r) => {
  await transactionService.approveRequest({
    id: r.transaction_id,
    type: r.status,
    book_id: r.book_id,
  });

  // 🔥 INSTANT REMOVE FROM UI
  setData(prev => prev.filter(item => item.transaction_id !== r.transaction_id));
};

const handleReject = async (id) => {
  await transactionService.rejectRequest(id);

  // 🔥 INSTANT REMOVE
  setData(prev => prev.filter(item => item.transaction_id !== id));
};

  return (
    <>
      <Navbar />

      <div className="requests-container">
        <h2>Requests</h2>

        {data.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Book</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {data.map((r) => (
                <tr key={r.transaction_id}>
                  <td>{r.user_name}</td>
                  <td>{r.book_title}</td>

                  <td>
                    <span
                      className={`status ${
                        r.status === "pending_borrow"
                          ? "pending"
                          : "return"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td>
                    <button
  className="action-btn approve"
  onClick={() => handleApprove(r)}
>
  Approve
</button>

                    <button
                      className="action-btn reject"
                      onClick={() => handleReject(r.transaction_id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default Requests;