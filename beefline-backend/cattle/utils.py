"""
Utility functions for cattle app, including image processing.
"""
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import os


def optimize_image(image_file, max_size=(1200, 1200), quality=85):
    """
    Optimize and resize uploaded images.
    
    Args:
        image_file: Uploaded image file
        max_size: Maximum dimensions (width, height)
        quality: JPEG quality (1-100)
    
    Returns:
        InMemoryUploadedFile: Optimized image
    """
    img = Image.open(image_file)
    
    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    # Resize maintaining aspect ratio
    img.thumbnail(max_size, Image.LANCZOS)
    
    # Save optimized image
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    # Get filename without extension
    filename = os.path.splitext(image_file.name)[0]
    
    return InMemoryUploadedFile(
        output,
        'ImageField',
        f"{filename}.jpg",
        'image/jpeg',
        output.getbuffer().nbytes,
        None
    )


def create_thumbnail(image_file, size=(300, 300), quality=80):
    """
    Create thumbnail version of image.
    
    Args:
        image_file: Uploaded image file
        size: Thumbnail dimensions (width, height)
        quality: JPEG quality (1-100)
    
    Returns:
        InMemoryUploadedFile: Thumbnail image
    """
    img = Image.open(image_file)
    
    # Convert to RGB if necessary
    if img.mode in ('RGBA', 'LA', 'P'):
        img = img.convert('RGB')
    
    # Create thumbnail
    img.thumbnail(size, Image.LANCZOS)
    
    # Save thumbnail
    output = BytesIO()
    img.save(output, format='JPEG', quality=quality, optimize=True)
    output.seek(0)
    
    # Get filename without extension
    filename = os.path.splitext(image_file.name)[0]
    
    return InMemoryUploadedFile(
        output,
        'ImageField',
        f"{filename}_thumb.jpg",
        'image/jpeg',
        output.getbuffer().nbytes,
        None
    )


def validate_image_file(file):
    """
    Validate uploaded image file.
    
    Args:
        file: Uploaded file
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB in bytes
    if file.size > max_size:
        return False, "Image file size must not exceed 5MB"
    
    # Check file extension
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        return False, f"Invalid file format. Allowed formats: {', '.join(valid_extensions)}"
    
    # Try to open as image
    try:
        img = Image.open(file)
        img.verify()
        return True, None
    except Exception:
        return False, "Invalid image file"


def validate_document_file(file):
    """
    Validate uploaded document file.
    
    Args:
        file: Uploaded file
    
    Returns:
        tuple: (is_valid, error_message)
    """
    # Check file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if file.size > max_size:
        return False, "Document file size must not exceed 10MB"
    
    # Check file extension
    valid_extensions = ['.pdf', '.jpg', '.jpeg', '.png']
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in valid_extensions:
        return False, f"Invalid file format. Allowed formats: {', '.join(valid_extensions)}"
    
    return True, None
