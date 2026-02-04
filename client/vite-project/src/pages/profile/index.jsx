import React from 'react';
// افترضنا إنك هتاخد البيانات من الـ Store أو من Props
import { useSelector } from 'react-redux';
import { Link } from 'react-router';
import { useDeleteUserProfileMutation } from '../../Redux/user/userApi';
import Swal from 'sweetalert2';
const Profile = () => {

  const userData = useSelector((state) => state.auth.user);
  const [deleteUser] = useDeleteUserProfileMutation();
  // بيانات تجريبية في حال عدم وجود بيانات حقيقية حالياً
// 2. حماية الكود: لو البيانات لسه مش موجودة، يظهر لودينج بدل ما يضرب
  if (!userData) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status"></div>
        <p className="mt-2">Loading profile...</p>
      </div>
    );
  }
  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (result.isConfirmed) {
      try {
        await deleteUser(userData._id).unwrap();
        Swal.fire('Deleted!', 'Your account has been deleted.', 'success');
        // هنا ممكن تضيف إعادة توجيه للصفحة الرئيسية أو صفحة تسجيل الدخول
      } catch (err) {
        Swal.fire('Error!', err.data?.message || 'Failed to delete account.', 'error');
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow border-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            {/* Header / Cover Space */}
            <div className="bg-success" style={{ height: '100px' }}></div>
            
            <div className="card-body text-center position-relative">
              {/* Profile Image */}
              <div className="position-absolute top-0 start-50 translate-middle">
                <img 
                  src={userData.avatar} 
                  alt="Profile" 
                  className="rounded-circle border border-4 border-white shadow"
                  style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                />
              </div>

              <div style={{ marginTop: '60px' }}>
                {/* <h3 className="fw-bold mb-0">{userData.name}</h3> */}
                <p className="text-muted">@{userData.username}</p>
              </div>

              <hr className="my-4 text-secondary" />

              {/* Personal Info List */}
              <div className="text-start px-3">
                <h6 className="text-uppercase text-muted small fw-bold mb-3">Personal Information</h6>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light p-2 rounded-circle me-3">
                    <i className="bi bi-envelope-fill text-success"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Email Address</p>
                    <p className="mb-0 fw-medium">{userData.email}</p>
                  </div>
                </div>

                <div className="d-flex align-items-center mb-3">
                  <div className="bg-light p-2 rounded-circle me-3">
                    <i className="bi bi-person-badge-fill text-success"></i>
                  </div>
                  <div>
                    <p className="mb-0 text-muted small">Account ID</p>
                    <p className="mb-0 fw-medium text-truncate" style={{ maxWidth: '200px' }}>
                      {userData._id || "65a123...890"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="d-grid gap-2 d-md-flex justify-content-md-center mt-4">
                {userData.role === 'admin' ? null : (
                  <Link to="/profile/edit" className="btn btn-outline-success btn-sm px-4 rounded-pill">
                    Edit Profile
                  </Link>
                )}
                <button onClick={handleDeleteAccount} className="btn btn-danger btn-sm px-4 rounded-pill">
                  delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;