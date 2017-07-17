import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import classnames from 'classnames'
import { update as updateOptions } from '../../ducks/options'

PureBooleanOption.PropTypes = {
    value: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
}

function PureBooleanOption({ value, onChange, ...props}) {
        return (
                <input type="checkbox"
                        checked={value}
                        onChange={onChange}
                        onMouseOver={props.onMouseEnter}
                        onMouseLeave={props.onMouseLeave}
                />
        )
}

PureStringOption.PropTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

function PureStringOption( { value, onChange, ...props }) {
    let onKeyDown = (e) => {e.stopPropagation()}
    return (
        <div className={classnames('input-group', {'has-error': props.error})}>
            <input type="text"
                    value={value}
                    className='form-control'
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    onMouseOver={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
            />
        </div>
    )
}

PureNumberOption.PropTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
}

function PureNumberOption( {value, onChange, ...props }) {
    let onKeyDown = (e) => {e.stopPropagation()}

    return (
            <input type="number"
                    className="form-control"
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    onFocus={props.onFocus}
                    onBlur={props.onBlur}
                    onMouseOver={props.onMouseEnter}
                    onMouseLeave={props.onMouseLeave}
            />
    )
}

PureChoicesOption.PropTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
}

function PureChoicesOption( { value, onChange, name, choices, ...props}) {
    return (
            <select
                name={name}
                className="form-control"
                onChange={onChange}
                selected={value}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                onMouseOver={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
            >
                { choices.map((choice, index) => (
                    <option key={index} value={choice}> {choice} </option>
                ))}
            </select>
    )
}

class PureStringSequenceOption extends Component {
    constructor(props, context) {
        super(props, context)
        this.state = { height: 1, focus: false, value: this.props.value}

        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onKeyDown = this.onKeyDown.bind(this)
        this.onChange = this.onChange.bind(this)
    }

    onFocus() {
        this.setState( {focus: true, height: 3 })
        this.props.onFocus()
    }

    onBlur() {
        this.setState( {focus: false, height: 1})
        this.props.onBlur()
    }

    onKeyDown(e) {
        e.stopPropagation()
    }

    onChange(e) {
        const value = e.target.value.split("\n")
        this.props.onChange(e)
        this.setState({ value })
    }

    render() {
        const {height, value} = this.state
        const {error, onMouseEnter, onMouseLeave} = this.props
        return (
            <div className={classnames('input-group', {'has-error': error})}>
            <textarea
                rows={height}
                value={value}
                className="form-control"
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            />
            </div>
        )
    }
}

const OptionTypes = {
    bool: PureBooleanOption,
    str: PureStringOption,
    int: PureNumberOption,
    "optional str": PureStringOption,
    "sequence of str": PureStringSequenceOption,
}

class OptionMaster extends Component {

    constructor(props, context) {
        super(props, context)
        this.state = {
                option: this.props.option,
                name: this.props.name,
                mousefocus: false,
                focus: false,
                error: false,
        }
        if (props.option.choices) {
            this.WrappedComponent = PureChoicesOption
        } else {
            this.WrappedComponent = OptionTypes[props.option.type]
        }
        this.onChange = this.onChange.bind(this)
        this.onMouseEnter = this.onMouseEnter.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ option: nextProps.option })
    }

    onChange(e) {
        const { option, name } = this.state
        const { updateOptions } = this.props
        switch (option.type) {
            case 'bool' :
                updateOptions({[name]: !option.value})
                break
            case 'int':
                updateOptions({[name]: parseInt(e.target.value)})
                break
            case 'sequence of str':
                const value = e.target.value.split('\n')
                updateOptions({[name]: value})
                break
            default:
                updateOptions({[name]: e.target.value})
        }
    }

    onMouseEnter() {
        this.setState({ mousefocus: true })
    }

    onMouseLeave() {
        this.setState({ mousefocus: false })
    }

    onFocus() {
        this.setState({ focus: true })
    }

    onBlur() {
        this.setState({ focus: false })
    }

    render() {
        const { name, children, client_options } = this.props
        const { option, focus, mousefocus } = this.state
        const WrappedComponent = this.WrappedComponent
        let error = (name in client_options) ? client_options[name].error : false,
            value = (name in client_options) ? client_options[name].value : option.value
        return (
            <div className="row">
                <div className="col-sm-8">
                    {name}
                </div>
                <div className="col-sm-4">
                    <WrappedComponent
                        children={children}
                        value={value}
                        onChange={this.onChange}
                        name={name}
                        choices={option.choices}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onMouseEnter={this.onMouseEnter}
                        onMouseLeave={this.onMouseLeave}
                        error={error}
                    />
                    {(focus || mousefocus) && (
                        <div className="tooltip tooltip-bottom" role="tooltip" style={{opacity: 1}}>
                        <div className="tooltip-inner">
                            {option.help}
                        </div>
                    </div>)}
                </div>
            </div>
        )
    }
}

export default connect(
    state => ({
        client_options: state.ui.option
    }),
    {
       updateOptions
    }
)(OptionMaster)
