import React from 'react';
import _ from 'lodash';
import dayjs from 'dayjs';
import { Bar } from 'react-chartjs-2';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './../index.css';

const normalize = (data) => {
  let divider = 1000;
  let unit = 'thousands';
  let u = 'k';
  if (!data || !data.length) return { data: [] };
  if (data[0] > 10000000) {
    divider = 1000000;
    unit = 'milllion';
    u = 'm';
  }
  if (data[0] > 10000000000) {
    divider = 1000000000;
    unit = 'billion';
    u = 'b';
  }
  return { data: data.map(d => d/divider), unit, u, divider };
};

const attributes = [{
  backgroundColor: 'green',
  borderColor: 'green',
  attr: 'cc',
  label: 'Cash and Cash Equivalent'
}, {
  backgroundColor: '#5DADE2',
  borderColor: '#5DADE2',
  attr1: 'ca',
  attr2: 'cc',
  label: 'Current Asset Minus Cash and Cash Equivalent'
}, {
  backgroundColor: 'orange',
  borderColor: 'orange',
  attr: 'ld',
  label: 'Long Term Debt'
}, {
  backgroundColor: 'red',
  borderColor: 'red',
  attr: 'std',
  label: 'Short Term Debt'
}].reverse();

const genDataSetAndAttributes = (attribute, data) => {
  return {
    fill: false,
    lineTension: 0,
    borderWidth: 2,
    pointRadius: 2,
    pointHoverRadius: 5,
    data: data.map(d => {
      return attribute.attr ? _.get(d, attribute.attr) : _.get(d, attribute.attr1) - _.get(d, attribute.attr2);
    }),
    all: data,
    ...attribute
  };
};

export class AnalystTrends extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { profile } = this.props;
    if (!profile) return true;
    if (nextState.copied) return true;
    if (profile.ticker !== nextProps.profile.ticker) return true;
    return false;
  }

  render() {
    const { profile, prop = 'balance_sheet_av', imgProp = 'cash_and_debt_img' } = this.props;
    // eslint-disable-next-line
    const initialData = _.filter(_.get(profile, `${prop}.data`, []), d => d.ta).slice(-12);
    const { copied } = this.state;
    if (!profile) {
      return (
        <div style={{ fontSize: 14 }}>Not available at this time... </div>
      );
    }
    if (profile[imgProp] && profile[imgProp].url) {
      const btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-10' : 'react-components-show-url btn btn-sm btn-warning font-10';
      const btnText = copied ? 'Copied' : 'Copy Img';
      return (
        <div className='react-components-show-button'>
          <img alt={`${profile.ticker} - ${profile.name} debt and cash analysis`} src={profile[imgProp].url} style={{ width: '100%' }} />
          <CopyToClipboard text={profile[imgProp].url || ''}
            onCopy={() => this.setState({ copied: true })}
          >
            <button className={btnClass} value={btnText}>{btnText}</button>
          </CopyToClipboard>
        </div>
      );
    }
    const data = {
      labels: initialData.map(d => dayjs(d.reportDate).format('YYYYMM')),
      datasets: attributes.map(attr => genDataSetAndAttributes(attr, initialData))
    };
    const { divider, unit } = normalize(initialData.map(d => d.ta));
    const options = {
      legend: {
        labels: {
          fontSize: 10,
          boxWidth: 3,
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            fontSize: 12,
          },
          stacked: true,
          barPercentage: 0.4
        }],
        yAxes: [{
          ticks: {
            fontSize: 12,
            min: 0,
            callback: function(label, index, labels) {
              return Math.floor(label / divider);
            }
          },
          stacked: true
        }]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            const info = data.datasets[tooltipItem.datasetIndex];
            const reportDate = info.all[tooltipItem.datasetIndex].reportDate;
              var label = `${reportDate} ${info.label}: `;
              label += tooltipItem.yLabel || 'n/a';
              label += '%';
              return label;
          }
        }
      }
    };

    return (
      <div>
        <div style={{ width: '100%', padding: 5, fontSize: 14 }}>
          <div style={{ color: 'darkred', fontWeight: 'bold' }}>{profile.ticker} - {profile.name} <span className='green'>Cash and Debt Analysis</span>
            <span className='black' style={{ fontSize: 12, marginLeft: 5 }}>(unit: {unit})</span></div>
        </div>
        <div style={{ width: '100%' }}>
          <Bar data={data} height={180} options={options} />
        </div>
      </div>
    );
  }
}

export default AnalystTrends;