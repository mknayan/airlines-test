import React, { Fragment, PureComponent } from 'react';
import ReactImageFallback from "react-image-fallback";
import Parser from 'html-react-parser';
import { AJAX_PUBLIC_REQUEST } from '../../Constants/AppConstants';
import $ from 'jquery';
import DataTable from 'datatables/media/js/jquery.dataTables.min.js';
import 'datatables/media/css/jquery.dataTables.min.css';
import daterangepicker from 'daterangepicker';
import "../../Assets/css/daterangepicker.css";
import moment from 'moment';
import tz from 'moment-timezone';
import { toast } from "react-toastify";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            FligntData: [],
            DepartureAirportCode: '',
            ArrivalAirportCode: '',
            DepartureDate: moment().tz('Australia/Sydney').format('YYYY-MM-DD'),
            ReturnDate: moment().tz('Australia/Sydney').format('YYYY-MM-DD'),
            submitted: false,
        }
    }

    componentDidMount() {
        document.querySelector("body").scrollIntoView();
        this.getFligntData();

        $('.custom_date_range_1').daterangepicker({ singleDatePicker: true }, this.lcb1);
        $('.custom_date_range_2').daterangepicker({ singleDatePicker: true }, this.lcb2);
    }

    lcb1 = (DepartureDate) => {
        const converted_date = moment.tz(DepartureDate, 'Australia/Sydney')
        this.setState({
            DepartureDate: converted_date.format('YYYY-MM-DD')
        })
    }

    lcb2 = (ReturnDate) => {
        const converted_date = moment.tz(ReturnDate, 'Australia/Sydney')
        this.setState({
            ReturnDate: converted_date.format('YYYY-MM-DD')
        })
    }

    getFligntData = () => {
        AJAX_PUBLIC_REQUEST("GET", "flight", {}).then(results => {
            this.setState({
                FligntData: results,
                loading: false,
            });
            $('.data_table_style').DataTable({
                responsive: true,
                destroy: true,
                "oLanguage": {
                    "sSearch": "Quick Search: "
                },
                "aLengthMenu": [[50, 100, 150, 200, 250, 300], [50, 100, 150, 200, 250, 300]],
                "iDisplayLength": 50,
                "aaSorting": [],
            });
        });
    }

    changeHandler = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    submitHandler = (e) => {
        e.preventDefault();
        const form_data = {
            DepartureAirportCode: this.state.DepartureAirportCode.toUpperCase(),
            ArrivalAirportCode: this.state.ArrivalAirportCode.toUpperCase(),
            DepartureDate: this.state.DepartureDate + "T00:00:00+11:00",
            ReturnDate: this.state.ReturnDate + "T00:00:00+11:00",
        }
        if ((this.state.DepartureAirportCode.length != 3) && (this.state.DepartureAirportCode.length != 0)) {
            toast.error("Departure Airport Code should be 3 charecter");
        } else if ((this.state.ArrivalAirportCode.length != 3) && (this.state.ArrivalAirportCode.length != 0)) {
            toast.error("Arrival Airport Code should be 3 charecter");
        } else if (moment(this.state.ReturnDate) < moment(this.state.DepartureDate)) {
            toast.error("Return Date should not smaller than Departure Date");
        } else {
            this.setState({
                // loading: true,
                submitted: true
            });
            AJAX_PUBLIC_REQUEST("GET", "flight", form_data).then(results => {
                this.setState({
                    FligntData: results,
                    loading: false,
                    submitted: false,
                });
            });
        }
    }

    render() {

        return (

            <Fragment>
                <div className="site-wrapper">
                    <div className="filter_section">
                        <h1 className="text-center">Airline Lists</h1>
                        <form onSubmit={this.submitHandler}>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="DepartureAirportCode">Departure airport code:</label>
                                        <input type="text" className="form-control code_input" id="DepartureAirportCode" name="DepartureAirportCode" onChange={this.changeHandler} placeholder="i.e MEI" value={this.state.DepartureAirportCode} maxLength="3" />
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label for="ArrivalAirportCode">Arrival airport code:</label>
                                        <input type="text" className="form-control code_input" id="ArrivalAirportCode" name="ArrivalAirportCode" onChange={this.changeHandler} placeholder="i.e LHR" value={this.state.ArrivalAirportCode} maxLength="3" />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label for="DepartureDate">Departure date:</label>
                                        <input type="text" className="form-control custom_date_range_1" id="DepartureDate" name="DepartureDate" />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label for="ReturnDate">Return date:</label>
                                        <input type="text" className="form-control custom_date_range_2" id="ReturnDate" name="ReturnDate" />
                                    </div>
                                </div>
                                <div className="col-md-2">
                                    <div className="form-group">
                                        <label for="formGroupExampleInput">&nbsp;</label>
                                        <button type="submit" className="btn btn-primary btn_search" disabled={this.state.submitted}>{this.state.submitted ? 'Please Wait...' : 'Search'}</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <Fragment>
                        {
                            (this.state.loading) ?
                                <div className="loading container full_page_loader"></div>
                                :

                                <div className="tab-pane fade show active" id="tab_data" role="tabpanel" aria-labelledby="today-tab">
                                    <table className="table table-striped table-bordered nowrap data_table_style">
                                        <thead>
                                            <tr>
                                                <th><b>Airline logo</b></th>
                                                <th><b>Airline name</b></th>
                                                <th><b>Outbound flight duration</b></th>
                                                <th><b>Inbound flight duration</b></th>
                                                <th className="text-right leaderboard_totalSales" style={{ paddingRight: "10px !important" }} ><b>Total amount in USD</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                this.state.FligntData.length > 0 ?
                                                    <Fragment>
                                                        {
                                                            this.state.FligntData.map((FligntData_single, index) => {
                                                                return (
                                                                    <tr key={index}>
                                                                        <td>
                                                                            <ReactImageFallback
                                                                                src={FligntData_single.AirlineLogoAddress}
                                                                                fallbackImage={require('../../Assets/images/icon/close.png')}
                                                                                initialImage={require('../../Assets/images/preloader.gif')}
                                                                                alt={FligntData_single.AirlineName}
                                                                                className="img-responsive airline-logo" />
                                                                        </td>
                                                                        <td>{FligntData_single.AirlineName}</td>
                                                                        <td>{FligntData_single.OutboundFlightsDuration}</td>
                                                                        <td>{FligntData_single.InboundFlightsDuration}</td>
                                                                        <td className="text-right">{FligntData_single.TotalAmount}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                        }
                                                    </Fragment>
                                                    : <div className="no_data_found">No Data Found</div>
                                            }
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th><b>Airline logo</b></th>
                                                <th><b>Airline name</b></th>
                                                <th><b>Outbound flight duration</b></th>
                                                <th><b>Inbound flight duration</b></th>
                                                <th className="text-right"><b>Total amount in USD</b></th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                    <div className="clearfix"></div>
                                </div>
                        }
                    </Fragment>


                </div>
            </Fragment>

        );
    }
}

export default Home;