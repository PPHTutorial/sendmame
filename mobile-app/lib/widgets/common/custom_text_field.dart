import 'package:amenade_mobile/utils/responsive_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class CustomTextField extends StatefulWidget {
  final TextEditingController controller;
  final String? label;
  final String hint;
  final String? Function(String?)? validator;
  final TextInputType keyboardType;
  final bool obscureText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;
  final int? maxLines;
  final int? minLines;
  final List<TextInputFormatter>? inputFormatters;
  final bool readOnly;
  final VoidCallback? onTap;
  final String? initialValue;
  final bool enabled;

  // Additional InputDecoration fields for customization
  final Widget? icon;
  final String? labelText;
  final TextStyle? labelStyle;
  final TextStyle? textStyle;
  final String? helperText;
  final TextStyle? helperStyle;
  final int? helperMaxLines;
  final String? hintText;
  final TextStyle? hintStyle;
  final int? hintMaxLines;
  final String? errorText;
  final TextStyle? errorStyle;
  final int? errorMaxLines;
  final FloatingLabelBehavior? floatingLabelBehavior;
  final bool? isCollapsed;
  final bool? isDense;
  final EdgeInsetsGeometry? contentPadding;
  final BoxConstraints? prefixIconConstraints;
  final Widget? prefix;
  final String? prefixText;
  final TextStyle? prefixStyle;
  final BoxConstraints? suffixIconConstraints;
  final Widget? suffix;
  final String? suffixText;
  final TextStyle? suffixStyle;
  final String? counterText;
  final TextStyle? counterStyle;
  final bool? filled;
  final Color? fillColor;
  final Color? focusColor;
  final Color? hoverColor;
  final InputBorder? errorBorder;
  final InputBorder? focusedBorder;
  final InputBorder? focusedErrorBorder;
  final InputBorder? disabledBorder;
  final InputBorder? enabledBorder;
  final InputBorder? border;
  final String? semanticCounterText;
  final bool? alignLabelWithHint;
  final BoxConstraints? constraints;

  const CustomTextField({
    super.key,
    required this.controller,
    required this.hint,
    this.label,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
    this.maxLines = 1,
    this.minLines,
    this.inputFormatters,
    this.readOnly = false,
    this.onTap,
    this.initialValue,
    this.enabled = true,
    this.icon,
    this.labelText,
    this.labelStyle,
    this.helperText,
    this.helperStyle,
    this.helperMaxLines,
    this.textStyle,
    this.hintText,
    this.hintStyle,
    this.hintMaxLines,
    this.errorText,
    this.errorStyle,
    this.errorMaxLines,
    this.floatingLabelBehavior,
    this.isCollapsed,
    this.isDense,
    this.contentPadding,
    this.prefixIconConstraints,
    this.prefix,
    this.prefixText,
    this.prefixStyle,
    this.suffixIconConstraints,
    this.suffix,
    this.suffixText,
    this.suffixStyle,
    this.counterText,
    this.counterStyle,
    this.filled,
    this.fillColor,
    this.focusColor,
    this.hoverColor,
    this.errorBorder,
    this.focusedBorder,
    this.focusedErrorBorder,
    this.disabledBorder,
    this.enabledBorder,
    this.border,
    this.semanticCounterText,
    this.alignLabelWithHint,
    this.constraints,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label ?? '',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: theme.textTheme.bodyLarge?.color,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: widget.controller,
          initialValue: widget.initialValue,
          validator: widget.validator,
          keyboardType: widget.keyboardType,
          obscureText: _obscureText,
          maxLines: widget.maxLines,
          minLines: widget.minLines,
          inputFormatters: widget.inputFormatters,
          readOnly: widget.readOnly,
          enabled: widget.enabled,
          onTap: widget.onTap,
          style: widget.textStyle ??
              TextStyle(
                fontSize: 16,
                color: theme.textTheme.bodyLarge?.color,
              ),
          decoration: InputDecoration(
            icon: widget.icon,
            labelText: widget.labelText,
            labelStyle: widget.labelStyle,
            helperText: widget.helperText,
            helperStyle: widget.helperStyle,
            helperMaxLines: widget.helperMaxLines,
            hintText: widget.hintText ?? widget.hint,
            hintStyle: widget.hintStyle ??
                TextStyle(
                  color:
                      theme.textTheme.bodyMedium?.color?.withValues(alpha: 0.6),
                ),
            hintMaxLines: widget.hintMaxLines,
            errorText: widget.errorText,
            errorStyle: widget.errorStyle,
            errorMaxLines: widget.errorMaxLines,
            floatingLabelBehavior: widget.floatingLabelBehavior,
            isCollapsed: widget.isCollapsed,
            isDense: widget.isDense,
            contentPadding: widget.contentPadding ??
                ResponsiveUtils.responsiveSymmetricPadding(
                  context,
                  horizontal: 28,
                  vertical: 8,
                ),

            // Prefix fields
            prefixIcon: widget.prefixIcon != null
                ? Icon(
                    widget.prefixIcon,
                    color: theme.primaryColor,
                    size: ResponsiveUtils.responsiveSize(context, 20),
                  )
                : null,
            prefixIconConstraints: widget.prefixIconConstraints ??
                BoxConstraints(
                  minWidth: ResponsiveUtils.responsiveSize(context, 40),
                  minHeight: ResponsiveUtils.responsiveSize(context, 40),
                ),
            prefix: widget.prefix,
            prefixText: widget.prefixText,
            prefixStyle: widget.prefixStyle,

            // Suffix fields
            suffixIcon: widget.suffixIcon != null || widget.obscureText
                ? IconButton(
                    icon: Icon(
                      widget.obscureText
                          ? (_obscureText
                              ? Icons.visibility_off
                              : Icons.visibility)
                          : widget.suffixIcon,
                      color: theme.primaryColor,
                      size: ResponsiveUtils.responsiveSize(context, 20),
                    ),
                    onPressed: widget.obscureText
                        ? () => setState(() => _obscureText = !_obscureText)
                        : widget.onSuffixTap,
                  )
                : null,
            suffixIconConstraints: widget.suffixIconConstraints,
            suffix: widget.suffix,
            suffixText: widget.suffixText,
            suffixStyle: widget.suffixStyle,

            // Counter fields
            counterText: widget.counterText,
            counterStyle: widget.counterStyle,

            // Fill and color fields
            filled: widget.filled ?? true,
            fillColor: widget.fillColor ??
                theme.inputDecorationTheme.fillColor ??
                Colors.grey[50],
            focusColor: widget.focusColor,
            hoverColor: widget.hoverColor,

            // Border fields - use custom borders if provided, otherwise use defaults
            border: widget.border ??
                OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.dividerColor,
                    width: 1,
                  ),
                ),
            enabledBorder: widget.enabledBorder ??
                OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.dividerColor,
                    width: 1,
                  ),
                ),
            focusedBorder: widget.focusedBorder ??
                OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.primaryColor,
                    width: 2,
                  ),
                ),
            errorBorder: widget.errorBorder ??
                OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.error,
                    width: 1,
                  ),
                ),
            focusedErrorBorder: widget.focusedErrorBorder ??
                OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: theme.colorScheme.error,
                    width: 2,
                  ),
                ),
            disabledBorder: widget.disabledBorder,

            // Other fields
            semanticCounterText: widget.semanticCounterText,
            alignLabelWithHint: widget.alignLabelWithHint,
            constraints: widget.constraints,
          ),
        ),
      ],
    );
  }
}
