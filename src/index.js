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
  attr: 'ca',
  label: 'Current Asset'
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

  render() {
    const { profile, prop = 'balance_sheet', imgProp = 'cash_and_debt_img', theme = 'light' } = this.props;
    // eslint-disable-next-line
    const initialData = _.filter(_.get(profile, `${prop}.data`, []), d => d.ta).slice(-8);
    const { copied } = this.state;
    if (!profile) {
      return (
        <div style={{ fontSize: 12 }}>Not available at this time... </div>
      );
    }
    if (profile[imgProp] && profile[imgProp].url) {
      const btnClass = copied ? 'react-components-show-url btn btn-sm btn-danger disabled font-12' : 'react-components-show-url btn btn-sm btn-warning font-12';
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

    const gridColor = theme === 'light' ? 'rgba(80, 80, 80, 0.1)' : 'rgba(255, 255, 255, 0.2)';
    const fontColor = theme === 'light' ? '#444444' : '#dddddd';

    const data = {
      labels: initialData.map(d => dayjs(d.reportDate).format('YYYYMM')),
      datasets: attributes.map(attr => genDataSetAndAttributes(attr, initialData))
    };
    const currency = _.get(initialData, '0.currency') || 'USD';
    const currencyStr = currency === 'USD' ? '' : ` ${currency}`;
    const { divider, unit } = normalize(initialData.map(d => d.ta));
    const options = {
      legend: {
        labels: {
          fontSize: 12,
          fontColor,
          boxWidth: 3,
        }
      },
      scales: {
        xAxes: [{
          ticks: {
            fontSize: 12,
            fontColor,
          },
          stacked: true,
          barPercentage: 0.4,
          gridLines: {
            color: gridColor
          },
        }],
        yAxes: [{
          ticks: {
            fontSize: 12,
            fontColor,
            min: 0,
            callback: function(label, index, labels) {
              return Math.floor(label / divider);
            }
          },
          gridLines: {
            color: gridColor
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
      <div style={{ width: '100%', padding: 5, fontSize: 12 }}>
        <div className={`theme-darkred-${theme} mb-2`} style={{ fontWeight: 'bold' }}>{profile.ticker} - {profile.name}&nbsp;<span className={`theme-green-${theme}`}>Cash Analysis</span><span className={`theme-black-${theme}`} style={{ fontSize: 12 }}>&nbsp;(unit: {unit}{currencyStr})</span></div>
        <Bar data={data} height={180} options={options} />
        <div style={{ fontSize: 12, padding: 5, paddingTop: 2 }}>Crafted by <a href='https://twitter.com/tradeideashq' target='_blank' className={`theme-darkred-${theme}`}>@tradeideashq</a> with <span style={{ fontSize: 16, color: 'red' }}>💡</span></div>
      </div>
    );
  }
}

export default AnalystTrends;
