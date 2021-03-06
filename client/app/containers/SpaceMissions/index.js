/*
 * SpaceMissions
 *
 * This is the first thing users see of our App, at the '/' route
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import moment from 'moment';
import { createStructuredSelector } from 'reselect';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';

// Imported components
import Header from 'components/Header';
import SearchFilters from 'containers/SearchFilters';
import SearchResults from 'components/SearchResults';

import { requestPageData } from './actions';
import reducer from './reducer';
import saga from './saga';
import {
  makeSelectLoading,
  makeSelectLaunches,
  makeSelectLaunchPads,
  makeSelectAvailableYears,
} from './selectors';
import './SpaceMissions.scss';

// eslint-disable-next-line react/prefer-stateless-function
export class SpaceMissions extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        keywords: '',
        launchPad: 'Any',
        minYear: 'Any',
        maxYear: 'Any',
      },
    };
  }

  componentWillMount() {
    this.props.requestData();
  }

  applyFilters = (filters) => {
    this.setState({ filters });
  };

  filterLaunches = (launches) => {
    const { keywords, launchPad, minYear, maxYear } = this.state.filters;
    let filteredLaunches = launches;
    if (keywords) {
      filteredLaunches = filteredLaunches.filter(
        (launch) =>
          launch.flight_number === parseInt(keywords, 10) ||
          launch.rocket.rocket_name.includes(keywords) ||
          launch.payloads[0].payload_id.includes(keywords)
      );
    }

    if (launchPad !== 'Any') {
      filteredLaunches = filteredLaunches.filter(
        (launch) => launch.launch_site.site_id === launchPad
      );
    }

    if (minYear !== 'Any' && minYear !== 'Any') {
      filteredLaunches = filteredLaunches.filter((launch) => {
        const launchDate = parseInt(
          moment(launch.launch_date_local).format('YYYY'),
          10
        );

        return (
          launchDate >= parseInt(minYear, 10) &&
          launchDate <= parseInt(maxYear, 10)
        );
      });
    }

    return filteredLaunches;
  };

  render() {
    const { launches, loading, launchpads, availableYears } = this.props;
    const { filters } = this.state;
    const filteredLaunches = this.filterLaunches(launches);

    return (
      <div>
        <Header />
        <div className="wrapper">
          <SearchFilters
            filters={filters}
            launchpads={launchpads}
            availableYears={availableYears}
            applyFilters={this.applyFilters}
          />
          <SearchResults launches={filteredLaunches} loading={loading} />
        </div>
      </div>
    );
  }
}

SpaceMissions.propTypes = {
  requestData: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  launches: PropTypes.array.isRequired,
  launchpads: PropTypes.array.isRequired,
  availableYears: PropTypes.array.isRequired,
};

export function mapDispatchToProps(dispatch) {
  return {
    requestData: () => dispatch(requestPageData()),
  };
}

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  launches: makeSelectLaunches(),
  launchpads: makeSelectLaunchPads(),
  availableYears: makeSelectAvailableYears(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);
const withReducer = injectReducer({ key: 'spacemissions', reducer });
const withSaga = injectSaga({ key: 'spacemissions', saga });

export default compose(
  withReducer,
  withConnect,
  withSaga
)(SpaceMissions);
