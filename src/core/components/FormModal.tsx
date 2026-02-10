import { Modal, Button } from 'react-bootstrap'
import { Formik, Form, Field, ErrorMessage, useField } from 'formik'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useTheme } from '../../core/hooks/useTheme'
import DatePicker, { DateObject } from 'react-multi-date-picker'
import Select from 'react-select'

interface FieldConfig {
    name: string
    type: string
    label: string
    as?: string
    options?: { value: any; label: string }[]
    multiple?: boolean
    bilingual?: {
        enName: string
        arName: string
    }
    placeholder?: string
    allowClear?: boolean
    closeOnSelect?: boolean
}

interface FormModalProps {
    show: boolean
    onHide: () => void
    onSubmit: (values: any) => void
    initialValues: any
    validationSchema: any
    title: string
    fields: FieldConfig[]
}

const FormModal = ({
    show,
    onHide,
    onSubmit,
    initialValues,
    validationSchema,
    title,
    fields,
}: FormModalProps) => {
    const { t, i18n } = useTranslation()
    const { mode } = useTheme()
    const language = i18n.language as 'en' | 'ar'
    const theme = mode

    // Custom styles for react-select
    const customSelectStyles = {
        control: (base: any) => ({
            ...base,
            backgroundColor: theme === 'light' ? '#f9f9f9' : '#1b1c22',
            border: 'none',
            borderRadius: '0px',
            padding: '0.3rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            color: theme === 'light' ? '#5e6278' : '#e4e6ef',
            boxShadow: 'none',
            minHeight: 'calc(1.5em + 1rem + 2px)',
            direction: language === 'ar' ? 'rtl' : 'ltr',
        }),
        menu: (base: any) => ({
            ...base,
            zIndex: 1000,
            backgroundColor: theme === 'light' ? '#ffffff' : '#1b1c22',
            marginTop: '4px',
            border: theme === 'light' ? '1px solid #e4e6ef' : '1px solid #1b1c22',
        }),
        option: (base: any, state: any) => ({
            ...base,
            backgroundColor: state.isSelected ? '#009ef7' : state.isFocused ? (theme === 'light' ? '#f1faff' : '#2b2b40') : (theme === 'light' ? '#ffffff' : '#1b1c22'),
            color: state.isSelected ? '#ffffff' : (theme === 'light' ? '#5e6278' : '#a1a5b7'),
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '1rem',
            direction: language === 'ar' ? 'rtl' : 'ltr',
        }),
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: theme === 'light' ? '#e4e6ef' : '#3f4254',
            borderRadius: '4px',
            padding: '2px 4px',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: theme === 'light' ? '#5e6278' : '#e4e6ef',
            fontSize: '0.9rem',
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: theme === 'light' ? '#5e6278' : '#e4e6ef',
            hover: {
                backgroundColor: theme === 'light' ? '#d1d3ea' : '#5e6278',
                color: theme === 'light' ? '#3f4254' : '#ffffff',
            },
        }),
        placeholder: (base: any) => ({
            ...base,
            color: theme === 'light' ? '#a1a5b7' : '#7e8299',
            fontSize: '1rem',
        }),
        input: (base: any) => ({
            ...base,
            color: theme === 'light' ? '#5e6278' : '#e4e6ef',
            direction: language === 'ar' ? 'rtl' : 'ltr',
        }),
    }

    interface BilingualConfig {
        baseName: string
        enName: string
        arName: string
        label: string
        type: string
    }

    const ValidationIcon = ({ name }: { name: string }) => {
        const [, meta] = useField(name)
        if (!meta.touched || !meta.error) return null
        return <div className="fv-plugins-icon-container"></div>
    }

    const BilingualInput = ({ enName, arName, label, type = 'text' }: { enName: string; arName: string; label: string; type?: string }) => {
        const [currentLang, setCurrentLang] = useState<'en' | 'ar'>(language)
        const [enField, enMeta] = useField(enName)
        const [arField, arMeta] = useField(arName)
        const hasError = (currentLang === 'en' && enMeta.touched && enMeta.error) || (currentLang === 'ar' && arMeta.touched && arMeta.error)
        const toggleLang = () => setCurrentLang(prev => prev === 'en' ? 'ar' : 'en')

        useEffect(() => {
            setCurrentLang(language)
        }, [language])

        return (
            <div className="fv-row mb-3">
                <label className="fw-bold fs-6 mb-2">{t(label)}</label>
                <div className="position-relative">
                    <div className={`input-group ${hasError ? 'is-invalid' : ''}`}>
                        <input
                            {...(currentLang === 'en' ? enField : arField)}
                            type={type}
                            className="form-control form-control-solid"
                            placeholder={t(label)}
                            dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
                        />
                        <button type="button" className="btn btn-light" onClick={toggleLang}>
                            {currentLang.toUpperCase()}
                        </button>
                    </div>
                    {hasError && <ValidationIcon name={currentLang === 'en' ? enName : arName} />}
                </div>
                <ErrorMessage name={enName} component="div" className="fv-plugins-message-container text-danger fs-7 mt-1" />
                <ErrorMessage name={arName} component="div" className="fv-plugins-message-container text-danger fs-7 mt-1" />
            </div>
        )
    }

    const renderField = (field: FieldConfig, index: number) => {
        if (field.bilingual) {
            return (
                <div key={field.name} className={index % 2 === 0 ? 'col-md-6' : 'col-md-6'}>
                    <BilingualInput
                        enName={field.bilingual.enName}
                        arName={field.bilingual.arName}
                        label={field.label}
                        type={field.type}
                    />
                </div>
            )
        }

        if (field.type === 'checkbox') {
            return (
                <div key={field.name} className="form-check form-switch mb-7">
                    <Field name={field.name}>
                        {({ field: formikField }: any) => (
                            <input
                                {...formikField}
                                type="checkbox"
                                className="form-check-input me-3"
                                id={field.name}
                                checked={formikField.value}
                            />
                        )}
                    </Field>
                    <label className="form-check-label fw-bold" htmlFor={field.name}>
                        {t(field.label)}
                    </label>
                    <ErrorMessage
                        name={field.name}
                        component="div"
                        className="text-danger fs-7 mt-1"
                    />
                </div>
            )
        }

        if (field.type === 'multi-date') {
            return (
                <div key={field.name} className={index % 2 === 0 ? 'col-md-6' : 'col-md-6'}>
                    <div className="fv-row mb-3">
                        <label className="fw-bold fs-6 mb-2">{t(field.label)}</label>
                        <Field name={field.name}>
                            {({ field, form, meta }: any) => {
                                const hasError = meta.touched && meta.error
                                return (
                                    <div className="position-relative">
                                        <DatePicker
                                            multiple
                                            value={field.value}
                                            onChange={(dates: DateObject[]) => {
                                                const dateArray = dates ? dates.map(date => date.toDate()) : []
                                                form.setFieldValue(field.name, dateArray)
                                            }}
                                            format="YYYY-MM-DD"
                                            placeholder={t(field.label)}
                                            inputClass={`form-control form-control-solid ${hasError ? 'is-invalid' : ''}`}
                                            containerStyle={{ width: '100%' }}
                                        />
                                        {hasError && <ValidationIcon name={field.name} />}
                                    </div>
                                )
                            }}
                        </Field>
                        <ErrorMessage
                            name={field.name}
                            component="div"
                            className="fv-plugins-message-container text-danger fs-7 mt-1"
                        />
                    </div>
                </div>
            )
        }

        if (field.type === 'select2') {
            return (
                <div key={field.name} className={index % 2 === 0 ? 'col-md-6' : 'col-md-6'}>
                    <div className="fv-row mb-3">
                        <label className="fw-bold fs-6 mb-2">{t(field.label)}</label>
                        <Field name={field.name}>
                            {({ field: formikField, form, meta }: any) => {
                                const hasError = meta.touched && meta.error
                                const selectedValues = Array.isArray(formikField.value) ? formikField.value : []
                                const value = field.multiple
                                    ? field.options?.filter((option: any) => selectedValues.includes(option.value)) || []
                                    : field.options?.find((option: any) => option.value === formikField.value) || null
                                return (
                                    <div className="position-relative" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                                        <Select
                                            isMulti={field.multiple}
                                            options={field.options}
                                            value={value}
                                            onChange={(selected: any) => {
                                                if (field.multiple) {
                                                    form.setFieldValue(field.name, selected ? selected.map((opt: any) => opt.value) : [])
                                                } else {
                                                    form.setFieldValue(field.name, selected ? selected.value : null)
                                                }
                                            }}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            placeholder={field.placeholder || t('select_option')}
                                            isClearable={field.allowClear !== false}
                                            closeMenuOnSelect={field.closeOnSelect === true}
                                            //className={`basic-multi-select ${hasError ? 'is-invalid' : ''}`}
                                            //classNamePrefix="select"
                                            styles={customSelectStyles}
                                        />
                                        {hasError && <ValidationIcon name={field.name} />}
                                    </div>
                                )
                            }}
                        </Field>
                        <ErrorMessage
                            name={field.name}
                            component="div"
                            className="fv-plugins-message-container text-danger fs-7 mt-1"
                        />
                    </div>
                </div>
            )
        }

        return (
            <div key={field.name} className={index % 2 === 0 ? 'col-md-6' : 'col-md-6'}>
                <div className="fv-row mb-3">
                    <label className="fw-bold fs-6 mb-2">{t(field.label)}</label>
                    {field.as === 'select' ? (
                        <Field name={field.name}>
                            {({ field: formikField, form, meta }: any) => {
                                const hasError = meta.touched && meta.error
                                return (
                                    <div className="position-relative">
                                        <select
                                            {...formikField}
                                            multiple={field.multiple}
                                            className={`form-select form-select-solid ${hasError ? 'is-invalid' : ''}`}
                                            value={formikField.value || (field.multiple ? [] : '')}
                                            onChange={(e) => {
                                                if (field.multiple) {
                                                    const selected = Array.from(e.target.selectedOptions, opt => Number(opt.value))
                                                    form.setFieldValue(field.name, selected)
                                                } else {
                                                    form.setFieldValue(field.name, e.target.value)
                                                }
                                            }}
                                        >
                                            {!field.multiple && <option value="">{t('select_option')}</option>}
                                            {field.options?.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        {hasError && <ValidationIcon name={field.name} />}
                                    </div>
                                )
                            }}
                        </Field>
                    ) : (
                        <Field name={field.name}>
                            {({ field: formikField, meta }: any) => {
                                const hasError = meta.touched && meta.error
                                return (
                                    <div className="position-relative">
                                        <input
                                            {...formikField}
                                            type={field.type}
                                            className={`form-control form-control-solid ${hasError ? 'is-invalid' : ''}`}
                                            placeholder={t(field.label)}
                                        />
                                        {hasError && <ValidationIcon name={field.name} />}
                                    </div>
                                )
                            }}
                        </Field>
                    )}
                    <ErrorMessage
                        name={field.name}
                        component="div"
                        className="fv-plugins-message-container text-danger fs-7 mt-1"
                    />
                </div>
            </div>
        )
    }

    return (
        <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values) => {
                        onSubmit(values)
                        onHide()
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form className="form w-100" noValidate>
                            {(() => {
                                const used = new Set<string>()
                                const bilinguals: BilingualConfig[] = []

                                const enFields = fields.filter(f =>
                                    f.type !== 'checkbox' &&
                                    typeof f.label === 'string' &&
                                    f.label.endsWith('.en')
                                )

                                for (const enField of enFields) {
                                    if (used.has(enField.name)) continue
                                    const labelPrefix = enField.label.slice(0, -3)
                                    const arLabel = `${labelPrefix}.ar`
                                    const arField = fields.find(f => f.label === arLabel)
                                    if (arField && !used.has(arField.name)) {
                                        bilinguals.push({
                                            baseName: labelPrefix,
                                            enName: enField.name,
                                            arName: arField.name,
                                            label: labelPrefix,
                                            type: enField.type,
                                        })
                                        used.add(enField.name)
                                        used.add(arField.name)
                                    }
                                }

                                const nonCheckboxes: FieldConfig[] = fields
                                    .filter((f) => !used.has(f.name) && f.type !== 'checkbox')
                                    .concat(
                                        bilinguals.map((b) => ({
                                            name: b.baseName,
                                            type: b.type,
                                            label: b.label,
                                            bilingual: {
                                                enName: b.enName,
                                                arName: b.arName,
                                            },
                                        } as FieldConfig))
                                    )

                                const checkboxes = fields.filter((f) => f.type === 'checkbox')
                                const rows: any[] = []

                                let fieldIndex = 0
                                for (let i = 0; i < nonCheckboxes.length; i += 2) {
                                    rows.push(
                                        <div className="row mb-3" key={`row-${i}`}>
                                            {renderField(nonCheckboxes[i], fieldIndex++)}
                                            {i + 1 < nonCheckboxes.length && renderField(nonCheckboxes[i + 1], fieldIndex++)}
                                        </div>
                                    )
                                }

                                return (
                                    <>
                                        {rows}
                                        {checkboxes.map(field => (
                                            <div className="mb-7" key={field.name}>
                                                {renderField(field, fieldIndex++)}
                                            </div>
                                        ))}
                                    </>
                                )
                            })()}

                            <div className="d-flex justify-content-end mt-5">
                                <Button variant="light" onClick={onHide} className="me-3" disabled={isSubmitting}>
                                    {t('cancel')}
                                </Button>
                                <Button variant="primary" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? t('saving') : t('save')}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal.Body>
        </Modal>
    )
}

export default FormModal