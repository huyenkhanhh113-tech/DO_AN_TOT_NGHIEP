import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { path } from "../../utils";
import "./HomeFooter.scss";

class HomeFooter extends Component {
  render() {
    return (
      <div className="home-footer">
        <div className="site-footer">
          <div className="container">
            <div className="row">
              {/* Cột thương hiệu + mô tả ngắn */}
              <div className="col-md-4 col-sm-12 footer-col">
                <div className="footer-brand">
                  <div className="footer-logo"></div>
                  <p className="footer-desc">
                    HealthyCare - Nền tảng đặt lịch khám bệnh trực tuyến, kết nối bạn
                    với đội ngũ bác sĩ và cơ sở y tế uy tín trên toàn quốc.
                  </p>
                </div>
              </div>

              {/* Cột liên kết nhanh */}
              <div className="col-md-2 col-sm-6 footer-col">
                <h6 className="footer-heading">Liên kết</h6>
                <ul className="footer-links">
                  <li>
                    <Link to={path.ALL_SPECIALTY}>Chuyên khoa</Link>
                  </li>
                  <li>
                    <Link to={path.ALL_CLINIC}>Cơ sở y tế</Link>
                  </li>
                  <li>
                    <Link to={path.ALL_DOCTOR}>Bác sĩ</Link>
                  </li>
                  <li>
                    <Link to={path.ALL_HANDBOOK}>Cẩm nang</Link>
                  </li>
                </ul>
              </div>

              {/* Cột hỗ trợ */}
              <div className="col-md-3 col-sm-6 footer-col">
                <h6 className="footer-heading">Hỗ trợ</h6>
                <ul className="footer-links">
                  <li>Hướng dẫn đặt lịch</li>
                  <li>Chính sách bảo mật</li>
                  <li>Điều khoản sử dụng</li>
                  <li>Câu hỏi thường gặp</li>
                </ul>
              </div>

              {/* Cột thông tin liên hệ */}
              <div className="col-md-3 col-sm-12 footer-col">
                <h6 className="footer-heading">Liên hệ</h6>
                <ul className="footer-contact">
                  <li>
                    <i className="fas fa-map-marker-alt"></i>
                    <span>123 Đường Nguyễn Trãi, Hà Nội</span>
                  </li>
                  <li>
                    <i className="fas fa-phone-alt"></i>
                    <span>1900 1234</span>
                  </li>
                  <li>
                    <i className="fas fa-envelope"></i>
                    <span>hotro@healthycare.vn</span>
                  </li>
                </ul>
                <ul className="social-icons">
                  <li>
                    <a className="facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a className="twitter" href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a className="youtube" href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
                      <i className="fab fa-youtube"></i>
                    </a>
                  </li>
                  <li>
                    <a className="linkedin" href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <hr />

            {/* Thanh bản quyền dưới cùng */}
            <div className="footer-bottom">
              <p className="copyright-text">
                Copyright &copy; 2026 HealthyCare. Bảo lưu mọi quyền.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
    // Chỗ chèn thêm dữ liệu
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomeFooter);
